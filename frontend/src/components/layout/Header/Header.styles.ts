import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderWrapper = styled.header`
 background-color: ${({ theme }) => theme.colors.background};
 border-bottom: 1px solid ${({ theme }) => theme.colors.border};
 position: sticky;
 top: 0;
 z-index: 1000;
 backdrop-filter: blur(10px);
 background-color: ${({ theme }) => theme.colors.backgroundAlpha};
`;

export const HeaderContainer = styled.div`
 max-width: 1200px;
 margin: 0 auto;
 padding: 0 1rem;
 height: 60px;
 display: flex;
 align-items: center;
 justify-content: space-between;
 
 @media (max-width: 768px) {
   padding: 0 0.75rem;
   height: 56px;
 }
`;

export const LogoSection = styled.div`
 display: flex;
 align-items: center;
 gap: 1rem;
`;

export const Logo = styled(Link)`
 display: flex;
 align-items: center;
 text-decoration: none;
 color: ${({ theme }) => theme.colors.primary};
 font-size: 1.5rem;
 font-weight: 700;
 letter-spacing: -0.02em;
 transition: all 0.2s ease;
 
 &:hover {
   color: ${({ theme }) => theme.colors.primaryHover};
   transform: translateY(-1px);
 }
 
 @media (max-width: 768px) {
   font-size: 1.25rem;
 }
`;

export const BetaBadge = styled.span`
 background-color: ${({ theme }) => theme.colors.accent};
 color: white;
 font-size: 0.625rem;
 font-weight: 600;
 padding: 0.125rem 0.375rem;
 border-radius: 4px;
 text-transform: uppercase;
 letter-spacing: 0.05em;
`;

export const NavSection = styled.nav`
 display: flex;
 align-items: center;
 gap: 2rem;
 flex: 1;
 margin: 0 2rem;
 
 @media (max-width: 968px) {
   display: none;
 }
`;

export const NavLink = styled(Link)<{ $active?: boolean }>`
 color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textSecondary};
 text-decoration: none;
 font-weight: 500;
 font-size: 0.875rem;
 transition: all 0.2s ease;
 position: relative;
 
 &:hover {
   color: ${({ theme }) => theme.colors.primary};
 }
 
 &::after {
   content: '';
   position: absolute;
   bottom: -21px;
   left: 0;
   right: 0;
   height: 3px;
   background-color: ${({ theme }) => theme.colors.primary};
   transform: scaleX(${({ $active }) => $active ? 1 : 0});
   transition: transform 0.2s ease;
 }
 
 &:hover::after {
   transform: scaleX(1);
 }
`;

export const SearchSection = styled.div`
 flex: 1;
 max-width: 400px;
 
 @media (max-width: 768px) {
   display: none;
 }
`;

export const SearchContainer = styled.div`
 position: relative;
 width: 100%;
`;

export const SearchInput = styled.input`
 width: 100%;
 padding: 0.5rem 1rem 0.5rem 2.5rem;
 border: 1px solid ${({ theme }) => theme.colors.border};
 border-radius: 20px;
 background-color: ${({ theme }) => theme.colors.inputBackground};
 color: ${({ theme }) => theme.colors.text};
 font-size: 0.875rem;
 transition: all 0.2s ease;
 
 &:focus {
   outline: none;
   border-color: ${({ theme }) => theme.colors.primary};
   box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryAlpha};
 }
 
 &::placeholder {
   color: ${({ theme }) => theme.colors.textMuted};
 }
`;

export const SearchIcon = styled.div`
 position: absolute;
 left: 0.75rem;
 top: 50%;
 transform: translateY(-50%);
 color: ${({ theme }) => theme.colors.textMuted};
 display: flex;
 align-items: center;
 justify-content: center;
 pointer-events: none;
 
 svg {
   width: 16px;
   height: 16px;
 }
`;

export const UserSection = styled.div`
 display: flex;
 align-items: center;
 gap: 1rem;
`;

export const IconButton = styled.button<{ $hasNotification?: boolean }>`
 position: relative;
 background: none;
 border: none;
 color: ${({ theme }) => theme.colors.textSecondary};
 cursor: pointer;
 padding: 0.5rem;
 border-radius: 8px;
 transition: all 0.2s ease;
 display: flex;
 align-items: center;
 justify-content: center;
 
 &:hover {
   background-color: ${({ theme }) => theme.colors.hoverBackground};
   color: ${({ theme }) => theme.colors.text};
 }
 
 svg {
   width: 20px;
   height: 20px;
 }
 
 ${({ $hasNotification }) => $hasNotification && `
   &::after {
     content: '';
     position: absolute;
     top: 6px;
     right: 6px;
     width: 8px;
     height: 8px;
     background-color: #ef4444;
     border-radius: 50%;
     border: 2px solid var(--background);
   }
 `}
`;

export const SubmitButton = styled(Link)`
 background-color: ${({ theme }) => theme.colors.primary};
 color: white;
 text-decoration: none;
 padding: 0.5rem 1rem;
 border-radius: 8px;
 font-weight: 500;
 font-size: 0.875rem;
 transition: all 0.2s ease;
 display: flex;
 align-items: center;
 gap: 0.5rem;
 
 &:hover {
   background-color: ${({ theme }) => theme.colors.primaryHover};
   transform: translateY(-1px);
   box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primaryAlpha};
 }
 
 @media (max-width: 768px) {
   padding: 0.5rem;
   font-size: 0;
   gap: 0;
   
   svg {
     font-size: 1rem;
   }
 }
`;

export const UserMenu = styled.div`
 position: relative;
`;

export const UserAvatar = styled.button`
 width: 36px;
 height: 36px;
 border-radius: 50%;
 overflow: hidden;
 border: 2px solid ${({ theme }) => theme.colors.border};
 cursor: pointer;
 transition: all 0.2s ease;
 background: none;
 padding: 0;
 
 &:hover {
   border-color: ${({ theme }) => theme.colors.primary};
   transform: scale(1.05);
 }
 
 img {
   width: 100%;
   height: 100%;
   object-fit: cover;
 }
`;

export const KarmaDisplay = styled.div`
 display: flex;
 align-items: center;
 gap: 0.25rem;
 color: ${({ theme }) => theme.colors.accent};
 font-weight: 600;
 font-size: 0.875rem;
 
 @media (max-width: 768px) {
   display: none;
 }
`;

export const MobileMenuButton = styled.button`
 display: none;
 background: none;
 border: none;
 color: ${({ theme }) => theme.colors.text};
 cursor: pointer;
 padding: 0.5rem;
 border-radius: 8px;
 transition: all 0.2s ease;
 
 &:hover {
   background-color: ${({ theme }) => theme.colors.hoverBackground};
 }
 
 svg {
   width: 24px;
   height: 24px;
 }
 
 @media (max-width: 968px) {
   display: flex;
   align-items: center;
   justify-content: center;
 }
`;

export const Dropdown = styled.div<{ $isOpen: boolean }>`
 position: absolute;
 top: calc(100% + 0.5rem);
 right: 0;
 background-color: ${({ theme }) => theme.colors.background};
 border: 1px solid ${({ theme }) => theme.colors.border};
 border-radius: 12px;
 box-shadow: 0 10px 40px ${({ theme }) => theme.colors.shadowLarge};
 min-width: 200px;
 opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
 visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
 transform: translateY(${({ $isOpen }) => $isOpen ? '0' : '-10px'});
 transition: all 0.2s ease;
 z-index: 1001;
`;

export const DropdownItem = styled(Link)`
 display: flex;
 align-items: center;
 gap: 0.75rem;
 padding: 0.75rem 1rem;
 color: ${({ theme }) => theme.colors.text};
 text-decoration: none;
 font-size: 0.875rem;
 transition: all 0.2s ease;
 
 &:hover {
   background-color: ${({ theme }) => theme.colors.hoverBackground};
   color: ${({ theme }) => theme.colors.primary};
 }
 
 &:first-child {
   border-radius: 12px 12px 0 0;
 }
 
 &:last-child {
   border-radius: 0 0 12px 12px;
 }
 
 svg {
   width: 16px;
   height: 16px;
   color: ${({ theme }) => theme.colors.textSecondary};
 }
`;

export const DropdownDivider = styled.div`
 height: 1px;
 background-color: ${({ theme }) => theme.colors.border};
 margin: 0.25rem 0;
`;

export const NotificationBadge = styled.span`
 background-color: ${({ theme }) => theme.colors.error};
 color: white;
 font-size: 0.625rem;
 font-weight: 600;
 padding: 0.125rem 0.375rem;
 border-radius: 10px;
 min-width: 18px;
 text-align: center;
`;

export const LiveIndicator = styled.div`
 display: flex;
 align-items: center;
 gap: 0.5rem;
 color: ${({ theme }) => theme.colors.success};
 font-size: 0.75rem;
 font-weight: 500;
 
 @media (max-width: 768px) {
   display: none;
 }
 
 &::before {
   content: '';
   width: 8px;
   height: 8px;
   background-color: currentColor;
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
     transform: scale(0.8);
   }
   100% {
     opacity: 1;
     transform: scale(1);
   }
 }
`;

export const EmailCount = styled.span`
 display: flex;
 align-items: center;
 gap: 0.25rem;
 color: ${({ theme }) => theme.colors.textSecondary};
 font-size: 0.75rem;
 
 svg {
   width: 14px;
   height: 14px;
 }
`;