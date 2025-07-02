const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

const options = {
 definition: {
   openapi: '3.0.0',
   info: {
     title: 'Shadownews API',
     version: '1.0.0',
     description: 'Enhanced Hacker News Clone with Email Repository and Snowball Distribution',
     contact: {
       name: 'Shadownews Team',
       email: 'api@shadownews.community',
       url: 'https://shadownews.community'
     },
     license: {
       name: 'MIT',
       url: 'https://opensource.org/licenses/MIT'
     }
   },
   servers: [
     {
       url: 'http://localhost:3000/api/v1',
       description: 'Development server'
     },
     {
       url: 'https://api.shadownews.community/v1',
       description: 'Production server'
     }
   ],
   components: {
     securitySchemes: {
       bearerAuth: {
         type: 'http',
         scheme: 'bearer',
         bearerFormat: 'JWT'
       },
       apiKey: {
         type: 'apiKey',
         in: 'header',
         name: 'X-API-Key'
       }
     }
   },
   security: [
     {
       bearerAuth: []
     }
   ]
 },
 apis: [
   './src/api/routes/*.routes.js',
   './src/models/*.model.js',
   './src/api/controllers/*.controller.js'
 ]
};

const generateApiDocs = async () => {
 try {
   console.log(chalk.blue('🚀 Starting API documentation generation...'));
   
   // Generate OpenAPI specification
   const openapiSpecification = swaggerJsdoc(options);
   
   // Create docs directory if it doesn't exist
   const docsDir = path.join(__dirname, '../../docs/api');
   await fs.mkdir(docsDir, { recursive: true });
   
   // Write OpenAPI JSON
   const jsonPath = path.join(docsDir, 'openapi.json');
   await fs.writeFile(jsonPath, JSON.stringify(openapiSpecification, null, 2));
   console.log(chalk.green(`✓ OpenAPI JSON written to ${jsonPath}`));
   
   // Generate Markdown documentation
   const markdownContent = generateMarkdown(openapiSpecification);
   const mdPath = path.join(docsDir, 'README.md');
   await fs.writeFile(mdPath, markdownContent);
   console.log(chalk.green(`✓ Markdown documentation written to ${mdPath}`));
   
   // Generate Postman collection
   const postmanCollection = generatePostmanCollection(openapiSpecification);
   const postmanPath = path.join(docsDir, 'shadownews.postman_collection.json');
   await fs.writeFile(postmanPath, JSON.stringify(postmanCollection, null, 2));
   console.log(chalk.green(`✓ Postman collection written to ${postmanPath}`));
   
   // Generate example requests
   const examplesContent = generateExamples(openapiSpecification);
   const examplesPath = path.join(docsDir, 'examples.md');
   await fs.writeFile(examplesPath, examplesContent);
   console.log(chalk.green(`✓ API examples written to ${examplesPath}`));
   
   console.log(chalk.blue('\n📚 API documentation generated successfully!'));
   console.log(chalk.yellow('\nNext steps:'));
   console.log(chalk.yellow('1. Review the generated documentation'));
   console.log(chalk.yellow('2. Import the Postman collection for testing'));
   console.log(chalk.yellow('3. Serve the OpenAPI spec with Swagger UI\n'));
   
 } catch (error) {
   console.error(chalk.red('❌ Error generating API documentation:'), error);
   process.exit(1);
 }
};

function generateMarkdown(spec) {
 let markdown = `# ${spec.info.title} API Documentation\n\n`;
 markdown += `${spec.info.description}\n\n`;
 markdown += `**Version:** ${spec.info.version}\n\n`;
 
 markdown += '## Servers\n\n';
 spec.servers.forEach(server => {
   markdown += `- ${server.description}: \`${server.url}\`\n`;
 });
 
 markdown += '\n## Authentication\n\n';
 markdown += 'This API uses JWT Bearer token authentication. Include the token in the Authorization header:\n\n';
 markdown += '```\nAuthorization: Bearer YOUR_JWT_TOKEN\n```\n\n';
 
 markdown += '## Endpoints\n\n';
 
 const paths = Object.keys(spec.paths).sort();
 const groupedPaths = groupPathsByTag(spec.paths);
 
 Object.keys(groupedPaths).forEach(tag => {
   markdown += `### ${tag}\n\n`;
   
   groupedPaths[tag].forEach(({ path, methods }) => {
     Object.keys(methods).forEach(method => {
       const operation = methods[method];
       markdown += `#### ${method.toUpperCase()} ${path}\n\n`;
       markdown += `${operation.summary || ''}\n\n`;
       
       if (operation.parameters && operation.parameters.length > 0) {
         markdown += '**Parameters:**\n\n';
         markdown += '| Name | In | Type | Required | Description |\n';
         markdown += '|------|-----|------|----------|-------------|\n';
         operation.parameters.forEach(param => {
           markdown += `| ${param.name} | ${param.in} | ${param.schema?.type || 'string'} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |\n`;
         });
         markdown += '\n';
       }
       
       if (operation.requestBody) {
         markdown += '**Request Body:**\n\n';
         markdown += '```json\n';
         markdown += JSON.stringify(getExampleFromSchema(operation.requestBody.content['application/json']?.schema), null, 2);
         markdown += '\n```\n\n';
       }
       
       markdown += '**Responses:**\n\n';
       Object.keys(operation.responses).forEach(status => {
         markdown += `- \`${status}\`: ${operation.responses[status].description}\n`;
       });
       markdown += '\n---\n\n';
     });
   });
 });
 
 return markdown;
}

function generatePostmanCollection(spec) {
 const collection = {
   info: {
     name: spec.info.title,
     description: spec.info.description,
     schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
   },
   auth: {
     type: 'bearer',
     bearer: [
       {
         key: 'token',
         value: '{{jwt_token}}',
         type: 'string'
       }
     ]
   },
   variable: [
     {
       key: 'base_url',
       value: spec.servers[0].url,
       type: 'string'
     },
     {
       key: 'jwt_token',
       value: '',
       type: 'string'
     }
   ],
   item: []
 };
 
 const groupedPaths = groupPathsByTag(spec.paths);
 
 Object.keys(groupedPaths).forEach(tag => {
   const folder = {
     name: tag,
     item: []
   };
   
   groupedPaths[tag].forEach(({ path, methods }) => {
     Object.keys(methods).forEach(method => {
       const operation = methods[method];
       const request = {
         name: operation.summary || `${method.toUpperCase()} ${path}`,
         request: {
           method: method.toUpperCase(),
           header: [
             {
               key: 'Content-Type',
               value: 'application/json'
             }
           ],
           url: {
             raw: `{{base_url}}${path}`,
             host: ['{{base_url}}'],
             path: path.split('/').filter(p => p)
           }
         }
       };
       
       if (operation.requestBody) {
         request.request.body = {
           mode: 'raw',
           raw: JSON.stringify(getExampleFromSchema(operation.requestBody.content['application/json']?.schema), null, 2)
         };
       }
       
       if (operation.parameters) {
         request.request.url.query = [];
         operation.parameters.forEach(param => {
           if (param.in === 'query') {
             request.request.url.query.push({
               key: param.name,
               value: '',
               description: param.description
             });
           }
         });
       }
       
       folder.item.push(request);
     });
   });
   
   collection.item.push(folder);
 });
 
 return collection;
}

function generateExamples(spec) {
 let examples = '# API Request Examples\n\n';
 
 const commonExamples = {
   'Authentication': [
     {
       title: 'Register a new user',
       request: `POST /api/v1/auth/register
Content-Type: application/json

{
 "email": "user@example.com",
 "username": "johndoe",
 "password": "SecurePassword123!"
}`,
       response: `{
 "success": true,
 "data": {
   "user": {
     "id": "507f1f77bcf86cd799439011",
     "email": "user@example.com",
     "username": "johndoe",
     "shadownewsEmail": "johndoe@shadownews.community"
   },
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 }
}`
     },
     {
       title: 'Login',
       request: `POST /api/v1/auth/login
Content-Type: application/json

{
 "email": "user@example.com",
 "password": "SecurePassword123!"
}`,
       response: `{
 "success": true,
 "data": {
   "user": {
     "id": "507f1f77bcf86cd799439011",
     "email": "user@example.com",
     "username": "johndoe",
     "karma": 150
   },
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 }
}`
     }
   ],
   'Posts': [
     {
       title: 'Create a post',
       request: `POST /api/v1/posts
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
 "title": "Shadownews launches revolutionary email repository feature",
 "url": "https://blog.shadownews.community/email-repository",
 "text": "We're excited to announce our new snowball distribution system...",
 "hashtags": ["#Innovation", "#EmailFirst", "#Community"]
}`,
       response: `{
 "success": true,
 "data": {
   "id": "507f1f77bcf86cd799439012",
   "title": "Shadownews launches revolutionary email repository feature",
   "url": "https://blog.shadownews.community/email-repository",
   "author": "johndoe",
   "karma": 1,
   "hashtags": ["#Innovation", "#EmailFirst", "#Community"],
   "createdAt": "2025-06-25T10:30:00Z"
 }
}`
     }
   ],
   'Repositories': [
     {
       title: 'Create a repository',
       request: `POST /api/v1/repositories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
 "name": "AI Healthcare Professionals",
 "description": "A curated list of professionals working at the intersection of AI and healthcare",
 "topic": "AI Healthcare",
 "isPublic": true,
 "hashtags": ["#AIHealthcare", "#MedTech", "#DigitalHealth"]
}`,
       response: `{
 "success": true,
 "data": {
   "id": "507f1f77bcf86cd799439013",
   "name": "AI Healthcare Professionals",
   "owner": "johndoe",
   "emailCount": 0,
   "subscribers": 1,
   "createdAt": "2025-06-25T10:30:00Z"
 }
}`
     },
     {
       title: 'Upload CSV to repository',
       request: `POST /api/v1/repositories/507f1f77bcf86cd799439013/csv
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

[CSV File: contacts.csv]
email,name,company
john@hospital.com,John Smith,City Hospital
sarah@aihealth.io,Sarah Johnson,AI Health Startup`,
       response: `{
 "success": true,
 "data": {
   "processed": 2,
   "added": 2,
   "duplicates": 0,
   "invalid": 0,
   "snowballPotential": 15
 }
}`
     }
   ]
 };
 
 Object.keys(commonExamples).forEach(category => {
   examples += `## ${category}\n\n`;
   commonExamples[category].forEach(example => {
     examples += `### ${example.title}\n\n`;
     examples += '**Request:**\n```http\n' + example.request + '\n```\n\n';
     examples += '**Response:**\n```json\n' + example.response + '\n```\n\n';
   });
 });
 
 return examples;
}

function groupPathsByTag(paths) {
 const grouped = {};
 
 Object.keys(paths).forEach(path => {
   Object.keys(paths[path]).forEach(method => {
     const operation = paths[path][method];
     const tags = operation.tags || ['Other'];
     
     tags.forEach(tag => {
       if (!grouped[tag]) {
         grouped[tag] = [];
       }
       
       const existingPath = grouped[tag].find(p => p.path === path);
       if (existingPath) {
         existingPath.methods[method] = operation;
       } else {
         grouped[tag].push({
           path,
           methods: { [method]: operation }
         });
       }
     });
   });
 });
 
 return grouped;
}

function getExampleFromSchema(schema) {
 if (!schema) return {};
 
 if (schema.example) return schema.example;
 
 if (schema.type === 'object' && schema.properties) {
   const example = {};
   Object.keys(schema.properties).forEach(prop => {
     example[prop] = getExampleFromSchema(schema.properties[prop]);
   });
   return example;
 }
 
 if (schema.type === 'array' && schema.items) {
   return [getExampleFromSchema(schema.items)];
 }
 
 const typeExamples = {
   string: 'string',
   number: 123,
   integer: 123,
   boolean: true,
   null: null
 };
 
 return typeExamples[schema.type] || 'example';
}

// Run the generator
if (require.main === module) {
 generateApiDocs();
}

module.exports = generateApiDocs;