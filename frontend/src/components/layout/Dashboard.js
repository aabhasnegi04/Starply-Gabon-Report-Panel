import React, { useState } from 'react';
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

const DRAWER_WIDTH = 260;

const Dashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('sticker');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const menuSections = [
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
      ]
    }
  ];


  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'sticker':
        return <StickerView />;
      case 'packing':
        return <PackingListView />;
      case 'load':
        return <LoadListView />;
      case 'main':
        return <MainListView />;
      case 'orderlist':
        return <OrderListView />;
      case 'orderlistdelivery':
        return <OrderListDeliveryView />;
      case 'pendingorders':
        return <PendingOrdersView />;
      case 'pendingsuborders':
        return <PendingSubOrdersView />;
      case 'currentmonthsummary':
        return <CurrentMonthSummaryView />;
      case 'datewisesummary':
        return <DateWiseSummaryView />;
      default:
        return <StickerView />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title Section with Close Button */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e0e0e0',
        background: '#1b4332',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon sx={{ fontSize: 28, color: '#ffffff' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff', letterSpacing: '0.3px' }}>
            Starply Report
          </Typography>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Menu Items */}
      <Box sx={{ pt: 2, px: 1.5, flexGrow: 1 }}>
        {menuSections.map((section, sectionIndex) => {
          const isOpen = section.key === 'logistics' ? logisticsOpen : summaryOpen;
          const setOpen = section.key === 'logistics' ? setLogisticsOpen : setSummaryOpen;
          
          return (
            <Box key={sectionIndex} sx={{ mb: 2 }}>
              {/* Section Heading - Clickable */}
              <ListItemButton
                onClick={() => setOpen(!isOpen)}
                sx={{
                  borderRadius: 1.5,
                  py: 1.5,
                  px: 2,
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
              
              {/* Section Items - Collapsible */}
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List sx={{ pt: 0.5 }}>
                  {section.items.map((item) => (
                    <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleViewChange(item.id)}
                        sx={{
                          borderRadius: 1.5,
                          py: 1.5,
                          px: 2,
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
                          minWidth: 40, 
                          color: activeView === item.id ? '#ffffff' : '#666',
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label} 
                          primaryTypographyProps={{
                            fontWeight: activeView === item.id ? 600 : 500,
                            fontSize: '0.95rem',
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
        <Toolbar sx={{ py: 1.5 }}>
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
              letterSpacing: '0.3px'
            }}
          >
            Starply Report
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
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer - Persistent, pushes content */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e0e0e0',
            mt: '64px',
            height: 'calc(100% - 64px)'
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
          width: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: drawerOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: 'margin-left 200ms ease, width 200ms ease',
          mt: '64px', // Height of AppBar
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {renderActiveView()}
      </Box>
    </Box>
  );
};

export default Dashboard;
