import styled from 'styled-components';
import { motion } from 'framer-motion';

export const HomeContainer = styled.div`
 min-height: 100vh;
 background: ${props => props.theme.colors.background};
 padding-top: 60px;
`;

export const HeroSection = styled.section`
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 color: white;
 padding: 3rem 0;
 margin-bottom: 2rem;
`;

export const HeroContent = styled.div`
 max-width: 1200px;
 margin: 0 auto;
 padding: 0 1rem;
 text-align: center;
`;

export const HeroTitle = styled(motion.h1)`
 font-size: 3rem;
 font-weight: 700;
 margin-bottom: 1rem;
 
 @media (max-width: 768px) {
   font-size: 2rem;
 }
`;

export const HeroSubtitle = styled(motion.p)`
 font-size: 1.25rem;
 opacity: 0.9;
 margin-bottom: 2rem;
 
 @media (max-width: 768px) {
   font-size: 1rem;
 }
`;

export const StatsRow = styled(motion.div)`
 display: flex;
 justify-content: center;
 gap: 3rem;
 flex-wrap: wrap;
 margin-top: 2rem;
 
 @media (max-width: 768px) {
   gap: 1.5rem;
 }
`;

export const StatItem = styled.div`
 text-align: center;
`;

export const StatNumber = styled.div`
 font-size: 2.5rem;
 font-weight: 700;
 margin-bottom: 0.25rem;
 
 @media (max-width: 768px) {
   font-size: 2rem;
 }
`;

export const StatLabel = styled.div`
 font-size: 0.875rem;
 opacity: 0.8;
 text-transform: uppercase;
 letter-spacing: 0.05em;
`;

export const MainContent = styled.main`
 max-width: 1200px;
 margin: 0 auto;
 padding: 0 1rem 2rem;
 display: grid;
 grid-template-columns: 1fr 300px;
 gap: 2rem;
 
 @media (max-width: 1024px) {
   grid-template-columns: 1fr;
 }
`;

export const FeedSection = styled.section`
 background: ${props => props.theme.colors.surface};
 border-radius: 8px;
 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
 overflow: hidden;
`;

export const FeedHeader = styled.div`
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 1rem 1.5rem;
 border-bottom: 1px solid ${props => props.theme.colors.border};
 background: ${props => props.theme.colors.background};
`;

export const FeedTitle = styled.h2`
 font-size: 1.25rem;
 font-weight: 600;
 color: ${props => props.theme.colors.text};
 display: flex;
 align-items: center;
 gap: 0.5rem;
`;

export const FeedFilters = styled.div`
 display: flex;
 gap: 0.5rem;
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
 padding: 0.5rem 1rem;
 border: none;
 background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
 color: ${props => props.$active ? 'white' : props.theme.colors.textSecondary};
 border-radius: 20px;
 font-size: 0.875rem;
 font-weight: 500;
 cursor: pointer;
 transition: all 0.2s ease;
 
 &:hover {
   background: ${props => props.$active ? props.theme.colors.primaryDark : props.theme.colors.backgroundHover};
 }
`;

export const PostsContainer = styled.div`
 display: flex;
 flex-direction: column;
`;

export const LoadMoreButton = styled(motion.button)`
 margin: 2rem auto;
 padding: 0.75rem 2rem;
 background: ${props => props.theme.colors.primary};
 color: white;
 border: none;
 border-radius: 25px;
 font-weight: 500;
 cursor: pointer;
 transition: all 0.2s ease;
 
 &:hover {
   background: ${props => props.theme.colors.primaryDark};
   transform: translateY(-2px);
   box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
 }
 
 &:disabled {
   opacity: 0.6;
   cursor: not-allowed;
 }
`;

export const Sidebar = styled.aside`
 display: flex;
 flex-direction: column;
 gap: 1.5rem;
 
 @media (max-width: 1024px) {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
 }
`;

export const SidebarCard = styled.div`
 background: ${props => props.theme.colors.surface};
 border-radius: 8px;
 padding: 1.5rem;
 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const SidebarCardTitle = styled.h3`
 font-size: 1rem;
 font-weight: 600;
 color: ${props => props.theme.colors.text};
 margin-bottom: 1rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
`;

export const TrendingList = styled.ul`
 list-style: none;
 padding: 0;
 margin: 0;
`;

export const TrendingItem = styled.li`
 padding: 0.75rem 0;
 border-bottom: 1px solid ${props => props.theme.colors.border};
 
 &:last-child {
   border-bottom: none;
   padding-bottom: 0;
 }
`;

export const TrendingLink = styled.a`
 color: ${props => props.theme.colors.text};
 text-decoration: none;
 font-size: 0.875rem;
 display: flex;
 align-items: center;
 gap: 0.5rem;
 transition: color 0.2s ease;
 
 &:hover {
   color: ${props => props.theme.colors.primary};
 }
`;

export const TrendingMeta = styled.span`
 color: ${props => props.theme.colors.textSecondary};
 font-size: 0.75rem;
 margin-left: auto;
`;

export const RepositoryItem = styled.div`
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 0.75rem 0;
 border-bottom: 1px solid ${props => props.theme.colors.border};
 
 &:last-child {
   border-bottom: none;
 }
`;

export const RepositoryInfo = styled.div`
 flex: 1;
`;

export const RepositoryName = styled.a`
 color: ${props => props.theme.colors.text};
 text-decoration: none;
 font-weight: 500;
 font-size: 0.875rem;
 display: block;
 margin-bottom: 0.25rem;
 
 &:hover {
   color: ${props => props.theme.colors.primary};
 }
`;

export const RepositoryStats = styled.div`
 display: flex;
 gap: 1rem;
 font-size: 0.75rem;
 color: ${props => props.theme.colors.textSecondary};
`;

export const EmailCount = styled.span`
 display: flex;
 align-items: center;
 gap: 0.25rem;
`;

export const GrowthIndicator = styled.span<{ $growth: 'up' | 'down' | 'neutral' }>`
 display: flex;
 align-items: center;
 gap: 0.25rem;
 color: ${props => 
   props.$growth === 'up' ? '#10b981' : 
   props.$growth === 'down' ? '#ef4444' : 
   props.theme.colors.textSecondary
 };
`;

export const QuickPostCard = styled(SidebarCard)`
 border: 2px dashed ${props => props.theme.colors.border};
 text-align: center;
 cursor: pointer;
 transition: all 0.2s ease;
 
 &:hover {
   border-color: ${props => props.theme.colors.primary};
   background: ${props => props.theme.colors.backgroundHover};
 }
`;

export const QuickPostIcon = styled.div`
 font-size: 2rem;
 margin-bottom: 0.5rem;
`;

export const QuickPostText = styled.p`
 color: ${props => props.theme.colors.textSecondary};
 font-size: 0.875rem;
 margin: 0;
`;

export const LiveIndicator = styled.span`
 display: inline-flex;
 align-items: center;
 gap: 0.5rem;
 color: #10b981;
 font-size: 0.75rem;
 font-weight: 500;
 
 &::before {
   content: '';
   width: 8px;
   height: 8px;
   background: currentColor;
   border-radius: 50%;
   animation: pulse 2s infinite;
 }
 
 @keyframes pulse {
   0% {
     opacity: 1;
     transform: scale(1);
   }
   50% {
     opacity: 0.5;
     transform: scale(1.1);
   }
   100% {
     opacity: 1;
     transform: scale(1);
   }
 }
`;

export const EmptyState = styled.div`
 text-align: center;
 padding: 4rem 2rem;
 color: ${props => props.theme.colors.textSecondary};
`;

export const EmptyStateIcon = styled.div`
 font-size: 4rem;
 margin-bottom: 1rem;
 opacity: 0.3;
`;

export const EmptyStateText = styled.p`
 font-size: 1.125rem;
 margin-bottom: 1.5rem;
`;

export const EmptyStateButton = styled.button`
 padding: 0.75rem 1.5rem;
 background: ${props => props.theme.colors.primary};
 color: white;
 border: none;
 border-radius: 6px;
 font-weight: 500;
 cursor: pointer;
 transition: all 0.2s ease;
 
 &:hover {
   background: ${props => props.theme.colors.primaryDark};
   transform: translateY(-2px);
 }
`;

export const FloatingActionButton = styled(motion.button)`
 position: fixed;
 bottom: 2rem;
 right: 2rem;
 width: 56px;
 height: 56px;
 border-radius: 50%;
 background: ${props => props.theme.colors.primary};
 color: white;
 border: none;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 1.5rem;
 cursor: pointer;
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
 transition: all 0.2s ease;
 z-index: 100;
 
 &:hover {
   background: ${props => props.theme.colors.primaryDark};
   transform: translateY(-2px);
   box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
 }
 
 @media (max-width: 768px) {
   bottom: 1rem;
   right: 1rem;
 }
`;