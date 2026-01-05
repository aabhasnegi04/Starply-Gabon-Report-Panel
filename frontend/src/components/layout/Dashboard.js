import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Chip, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, IconButton, Collapse
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ListIcon from '@mui/icons-material/List';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ForestIcon from '@mui/icons-material/Forest';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StickerView from '../container/StickerView';
import PackingListView from '../container/PackingListView';
import LoadListView from '../container/LoadListView';
import MainListView from '../container/MainListView';
import OrderListView from '../orders/OrderListView';
import OrderListDeliveryView from '../orders/OrderListDeliveryView';
import PendingOrdersView from '../orders/PendingOrdersView';
import PendingSubOrdersView from '../orders/PendingSubOrdersView';
import CurrentMonthSummaryView from '../summary/CurrentMonthSummaryView';
import DateWiseSummaryView from '../summary/DateWiseSummaryView';
import PlywoodDailyOperationsSummaryView from '../summary/PlywoodDailyOperationsSummaryView';
import RejectedPcsSummaryView from '../summary/RejectedPcsSummaryView';
import CurrentLogStockView from '../logs/CurrentLogStockView';
import LogClosingStockView from '../logs/LogClosingStockView';
import LogBuyingSummaryView from '../logs/LogBuyingSummaryView';
import LogInvoiceSummaryView from '../logs/LogInvoiceSummaryView';
import LogCuttingSummaryView from '../logs/LogCuttingSummaryView';
import AacConnectionView from '../container/AacConnectionView';
import ContainerLoadingView from '../container/ContainerLoadingView';
import ContainerMonthWiseView from '../container/ContainerMonthWiseView';
import UnifiedDashboard from './UnifiedDashboard';

const DRAWER_WIDTH = 260;

const Dashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard'); // Changed default to dashboard
  const [activeSection, setActiveSection] = useState(null); // Track which section we're in
  const [drawerOpen, setDrawerOpen] = useState(false); // Start closed on mobile
  const [logisticsOpen, setLogisticsOpen] = useState(false); // Start collapsed
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  // Handle responsive drawer behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setDrawerOpen(true); // Auto-open on desktop
      } else {
        setDrawerOpen(false); // Auto-close on mobile
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuSections = [
    {
      heading: 'Dashboard',
      key: 'dashboard',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: <DashboardIcon /> },
      ]
    },
    {
      heading: 'Logistics',
      key: 'logistics',
      items: [
        { id: 'sticker', label: 'Sticker', icon: <InventoryIcon /> },
        { id: 'packing', label: 'Packing List', icon: <DescriptionIcon /> },
        { id: 'load', label: 'Load List', icon: <LocalShippingIcon /> },
        { id: 'main', label: 'Main List', icon: <ListIcon /> },
        { id: 'orderlist', label: 'Order List - Date Wise', icon: <ListAltIcon /> },
        { id: 'orderlistdelivery', label: 'Order List - Delivery Date Wise', icon: <LocalShippingIcon /> },
        { id: 'pendingorders', label: 'Pending Orders', icon: <PendingActionsIcon /> },
        { id: 'pendingsuborders', label: 'Pending Sub Orders', icon: <AssignmentLateIcon /> },
      ]
    },
    {
      heading: 'Summary',
      key: 'summary',
      items: [
        { id: 'currentmonthsummary', label: 'Current Month Summary', icon: <SummarizeIcon /> },
        { id: 'datewisesummary', label: 'Date Wise Summary', icon: <DateRangeIcon /> },
        { id: 'plywooddailyoperationssummary', label: 'Plywood Daily Operations Summary', icon: <PrecisionManufacturingIcon /> },
      ]
    },
    {
      heading: 'Logs',
      key: 'logs',
      items: [
        { id: 'currentlogstock', label: 'Current Log Stock', icon: <ForestIcon /> },
        { id: 'logclosingstock', label: 'Log Closing Stock - As On Date', icon: <InventoryIcon /> },
        { id: 'logbuyingsummary', label: 'Log Buying Summary Month Wise', icon: <ShoppingCartIcon /> },
        { id: 'loginvoicesummary', label: 'Log Invoice Summary', icon: <ReceiptIcon /> },
        { id: 'logcuttingsummary', label: 'Log Cutting Summary', icon: <ContentCutIcon /> },
      ]
    }
  ];


  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    
    // Determine which section this view belongs to
    const logisticsViews = ['sticker', 'packing', 'load', 'main', 'orderlist', 'orderlistdelivery', 'pendingorders', 'pendingsuborders'];
    const summaryViews = ['currentmonthsummary', 'datewisesummary', 'plywooddailyoperationssummary'];
    const logsViews = ['currentlogstock', 'logclosingstock', 'logbuyingsummary', 'loginvoicesummary', 'logcuttingsummary'];
    
    if (logisticsViews.includes(viewId)) {
      setActiveSection('logistics');
    } else if (summaryViews.includes(viewId)) {
      setActiveSection('summary');
    } else if (logsViews.includes(viewId)) {
      setActiveSection('logs');
    } else {
      setActiveSection(null);
    }
    
    // Close drawer on mobile after selection
    if (window.innerWidth < 900) {
      setDrawerOpen(false);
    }
  };

  const handleBackToSection = () => {
    if (activeSection) {
      setActiveView('section-' + activeSection);
    } else {
      setActiveView('dashboard');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <UnifiedDashboard user={user} onSectionClick={handleViewChange} />;
      case 'section-logistics':
        return <UnifiedDashboard user={user} onSectionClick={handleViewChange} activeSection="logistics" onBackClick={() => setActiveView('dashboard')} />;
      case 'section-summary':
        return <UnifiedDashboard user={user} onSectionClick={handleViewChange} activeSection="summary" onBackClick={() => setActiveView('dashboard')} />;
      case 'section-logs':
        return <UnifiedDashboard user={user} onSectionClick={handleViewChange} activeSection="logs" onBackClick={() => setActiveView('dashboard')} />;
      case 'sticker':
        return <StickerView onBackClick={handleBackToSection} />;
      case 'packing':
        return <PackingListView onBackClick={handleBackToSection} />;
      case 'load':
        return <LoadListView onBackClick={handleBackToSection} />;
      case 'main':
        return <MainListView onBackClick={handleBackToSection} />;
      case 'orderlist':
        return <OrderListView onBackClick={handleBackToSection} />;
      case 'orderlistdelivery':
        return <OrderListDeliveryView onBackClick={handleBackToSection} />;
      case 'pendingorders':
        return <PendingOrdersView onBackClick={handleBackToSection} />;
      case 'pendingsuborders':
        return <PendingSubOrdersView onBackClick={handleBackToSection} />;
      case 'aacconnection':
        return <AacConnectionView onBackClick={handleBackToSection} />;
      case 'containerloading':
        return <ContainerLoadingView onBackClick={handleBackToSection} />;
      case 'containermonthwise':
        return <ContainerMonthWiseView onBackClick={handleBackToSection} />;
      case 'currentmonthsummary':
        return <CurrentMonthSummaryView onBackClick={handleBackToSection} />;
      case 'datewisesummary':
        return <DateWiseSummaryView onBackClick={handleBackToSection} />;
      case 'plywooddailyoperationssummary':
        return <PlywoodDailyOperationsSummaryView onBackClick={handleBackToSection} />;
      case 'rejectedpcssummary':
        return <RejectedPcsSummaryView onBackClick={handleBackToSection} />;
      case 'currentlogstock':
        return <CurrentLogStockView onBackClick={handleBackToSection} />;
      case 'logclosingstock':
        return <LogClosingStockView onBackClick={handleBackToSection} />;
      case 'logbuyingsummary':
        return <LogBuyingSummaryView onBackClick={handleBackToSection} />;
      case 'loginvoicesummary':
        return <LogInvoiceSummaryView onBackClick={handleBackToSection} />;
      case 'logcuttingsummary':
        return <LogCuttingSummaryView onBackClick={handleBackToSection} />;
      default:
        return <UnifiedDashboard user={user} onSectionClick={handleViewChange} />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title Section with Close Button */}
      <Box sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderBottom: '1px solid #e0e0e0',
        background: '#1b4332',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#ffffff' }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#ffffff', 
            letterSpacing: '0.3px',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            Starply Report
          </Typography>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            color: '#ffffff',
            display: { xs: 'flex', md: 'none' }, // Only show close button on mobile
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Menu Items */}
      <Box sx={{ pt: 2, px: { xs: 1, sm: 1.5 }, flexGrow: 1 }}>
        {menuSections.map((section, sectionIndex) => {
          let isOpen, setOpen;
          
          if (section.key === 'dashboard') {
            isOpen = true; // Dashboard section always open
            setOpen = () => {}; // No toggle for dashboard
          } else if (section.key === 'logistics') {
            isOpen = logisticsOpen;
            setOpen = setLogisticsOpen;
          } else if (section.key === 'summary') {
            isOpen = summaryOpen;
            setOpen = setSummaryOpen;
          } else if (section.key === 'logs') {
            isOpen = logsOpen;
            setOpen = setLogsOpen;
          }
          
          return (
            <Box key={sectionIndex} sx={{ mb: 2 }}>
              {/* Section Heading - Clickable (except for dashboard) */}
              {section.key !== 'dashboard' ? (
                <ListItemButton
                  onClick={() => setOpen(!isOpen)}
                  sx={{
                    borderRadius: 1.5,
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 1.5, sm: 2 },
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                >
                  <ListItemText 
                    primary={section.heading}
                    primaryTypographyProps={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      color: '#1b4332'
                    }}
                  />
                  {isOpen ? <ExpandLess sx={{ color: '#1b4332' }} /> : <ExpandMore sx={{ color: '#1b4332' }} />}
                </ListItemButton>
              ) : (
                <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 }, mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      color: '#1b4332'
                    }}
                  >
                    {section.heading}
                  </Typography>
                </Box>
              )}
              
              {/* Section Items - Collapsible */}
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List sx={{ pt: 0.5 }}>
                  {section.items.map((item) => (
                    <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleViewChange(item.id)}
                        sx={{
                          borderRadius: 1.5,
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1.5, sm: 2 },
                          backgroundColor: activeView === item.id ? '#1b4332' : 'transparent',
                          color: activeView === item.id ? '#ffffff' : '#666',
                          '&:hover': {
                            backgroundColor: activeView === item.id ? '#0f2419' : '#f5f5f5',
                            color: activeView === item.id ? '#ffffff' : '#1b4332',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 36, sm: 40 }, 
                          color: activeView === item.id ? '#ffffff' : '#666',
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label} 
                          primaryTypographyProps={{
                            fontWeight: activeView === item.id ? 600 : 500,
                            fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, // Above drawer
          background: '#1b4332',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ 
          py: { xs: 1, sm: 1.5 },
          minHeight: { xs: '56px', sm: '64px' }
        }}>
          <IconButton
            sx={{ color: 'white', mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600, 
              color: '#ffffff', 
              letterSpacing: '0.3px',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Starply Report
          </Typography>
          
          {/* Mobile Title - Shorter */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600, 
              color: '#ffffff', 
              letterSpacing: '0.3px',
              fontSize: '1.1rem',
              display: { xs: 'block', sm: 'none' }
            }}
          >
            Starply
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Chip 
              icon={<AccountCircleIcon />} 
              label={`${user?.username} (${user?.role})`}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                color: '#ffffff',
                fontWeight: 500,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: { xs: 'none', sm: 'flex' }
              }} 
            />
            <Button
              variant="outlined"
              startIcon={<LogoutIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
              onClick={onLogout}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'none',
                fontWeight: 500,
                minWidth: { xs: '40px', sm: 'auto' },
                px: { xs: 1, sm: 2 },
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Logout</Box>
              <LogoutIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer - Responsive: Temporary on mobile, Persistent on desktop */}
      <Drawer
        variant={{ xs: 'temporary', md: 'persistent' }}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e0e0e0',
            mt: { xs: '56px', sm: '64px' }, // Smaller AppBar on mobile
            height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' }
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%', 
            md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' 
          },
          ml: { 
            xs: 0, 
            md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 
          },
          transition: { 
            xs: 'none', 
            md: 'margin-left 200ms ease, width 200ms ease' 
          },
          mt: { xs: '56px', sm: '64px' }, // Responsive AppBar height
          minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
        }}
      >
        {renderActiveView()}
      </Box>
    </Box>
  );
};

export default Dashboard;
