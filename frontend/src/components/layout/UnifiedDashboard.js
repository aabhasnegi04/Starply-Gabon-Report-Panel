import { 
  Box, IconButton, Typography, Paper, Chip
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ForestIcon from '@mui/icons-material/Forest';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import LayersIcon from '@mui/icons-material/Layers';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './UnifiedDashboard.css';

const UnifiedDashboard = ({ onSectionClick, activeSection, onBackClick }) => {
  const dashboardSections = [
    {
      id: 'logistics',
      title: 'LOGISTICS',
      icon: <InventoryIcon />,
      color: '#2c5530',
      gradient: 'linear-gradient(135deg, #2c5530 0%, #1b4332 100%)',
      reports: [
        { id: 'sticker', label: 'Sticker' },
        { id: 'packing', label: 'Packing List' },
        { id: 'load', label: 'Load List' },
        { id: 'main', label: 'Main List' },
        { id: 'orderlist', label: 'Order List - Date Wise' },
        { id: 'orderlistdelivery', label: 'Order List - Delivery' },
        { id: 'pendingorders', label: 'Pending Orders' },
        { id: 'pendingsuborders', label: 'Pending Sub Orders' },
        { id: 'aacconnection', label: 'Get AAC Connection' },
        { id: 'containerloading', label: 'Container Loading - Client Wise' },
        { id: 'containermonthwise', label: 'Container Month Wise' }
      ]
    },
    {
      id: 'summary',
      title: 'SUMMARY',
      icon: <SummarizeIcon />,
      color: '#1565c0',
      gradient: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
      reports: [
        { id: 'currentmonthsummary', label: 'Current Month Summary' },
        { id: 'datewisesummary', label: 'Date Wise Summary' },
        { id: 'plywooddailyoperationssummary', label: 'Daily Operations' },
        { id: 'rejectedpcssummary', label: 'Rejected PCS Summary' }
      ]
    },
    {
      id: 'logs',
      title: 'LOG SECTION',
      icon: <ForestIcon />,
      color: '#6d4c41',
      gradient: 'linear-gradient(135deg, #6d4c41 0%, #3e2723 100%)',
      reports: [
        { id: 'currentlogstock', label: 'Current Log Stock' },
        { id: 'logclosingstock', label: 'Log Closing Stock' },
        { id: 'logbuyingsummary', label: 'Log Buying Summary' },
        { id: 'loginvoicesummary', label: 'Log Invoice Summary' },
        { id: 'logcuttingsummary', label: 'Log Cutting Summary' }
      ]
    },
    {
      id: 'plywood',
      title: 'PLYWOOD',
      icon: <PrecisionManufacturingIcon />,
      color: '#e65100',
      gradient: 'linear-gradient(135deg, #e65100 0%, #bf360c 100%)',
      reports: [
        { id: 'plywooddailyoperationssummary', label: 'Daily Operations' },
        { id: 'plywoodproduction', label: 'Production Reports' },
        { id: 'plywoodquality', label: 'Quality Control' }
      ]
    },
    {
      id: 'veneer',
      title: 'VENEER',
      icon: <LayersIcon />,
      color: '#6a1b9a',
      gradient: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
      reports: [
        { id: 'veneerstock', label: 'Veneer Stock' },
        { id: 'veneerprocessing', label: 'Processing Reports' },
        { id: 'veneerquality', label: 'Quality Reports' }
      ]
    }
  ];

  const handleBackToDashboard = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  // Section view - showing reports for selected section
  if (activeSection) {
    const section = dashboardSections.find(s => s.id === activeSection);
    
    return (
      <Box className="unified-dashboard" sx={{ 
        height: { xs: 'auto', md: '100vh' },
        minHeight: { xs: '100vh', md: 'auto' },
        overflow: { xs: 'visible', md: 'hidden' }
      }}>
        {/* Header */}
        <Box sx={{ 
          background: section.gradient,
          color: 'white',
          p: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <IconButton 
            onClick={handleBackToDashboard} 
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ fontSize: { xs: 24, md: 28 } }}>
              {section.icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
              {section.title}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip 
              label={`${section.reports.length} Reports`}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                color: 'white',
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            />
          </Box>
        </Box>

        {/* Reports Grid */}
        <Box sx={{ 
          minHeight: { xs: 'auto', md: 'calc(100vh - 180px)' },
          height: { xs: 'auto', md: 'calc(100vh - 180px)' },
          display: 'flex', 
          alignItems: 'flex-start',
          justifyContent: 'center',
          p: { xs: 2, md: 4 },
          pt: { xs: 2, md: 4 },
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          overflow: { xs: 'visible', md: 'auto' }
        }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: { xs: 2.5, md: 3.5 },
            maxWidth: '1400px',
            width: '100%',
            justifyItems: 'center',
            alignContent: 'start'
          }}>
            {section.reports.map((report, index) => (
              <Paper
                key={report.id}
                className="report-pill"
                onClick={() => onSectionClick(report.id)}
                sx={{
                  height: { xs: 120, md: 160 },
                  width: { xs: '100%', md: '300px' },
                  maxWidth: { xs: '100%', md: '300px' },
                  borderRadius: 3,
                  backgroundColor: 'white',
                  border: `3px solid ${section.color}20`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                  animationDelay: `${index * 0.1}s`,
                  position: 'relative',
                  overflow: 'hidden',
                  p: { xs: 2, md: 3 },
                  '&:hover': {
                    background: section.gradient,
                    color: 'white',
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: `0 16px 48px ${section.color}40`,
                    borderColor: 'transparent'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.6s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  }
                }}
              >
                {/* Icon */}
                <Box sx={{ 
                  width: { xs: 44, md: 52 },
                  height: { xs: 44, md: 52 },
                  borderRadius: '50%',
                  backgroundColor: `${section.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: { xs: 1.5, md: 2.5 },
                  transition: 'all 0.3s ease'
                }}>
                  <Box sx={{ 
                    fontSize: { xs: 22, md: 26 },
                    color: section.color,
                    opacity: 0.8
                  }}>
                    📊
                  </Box>
                </Box>

                {/* Report Title */}
                <Typography sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  textAlign: 'center',
                  letterSpacing: '0.3px',
                  lineHeight: 1.3,
                  maxWidth: '100%',
                  mb: { xs: 1, md: 1.5 }
                }}>
                  {report.label}
                </Typography>

                {/* Accent line */}
                <Box sx={{
                  width: '40px',
                  height: '3px',
                  backgroundColor: section.color,
                  borderRadius: '2px',
                  opacity: 0.6,
                  transition: 'all 0.3s ease'
                }} />
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  // Main dashboard
  return (
    <Box className="unified-dashboard">
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: { xs: 2, md: 3 }
      }}>
        {/* Desktop Layout */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          width: '100%',
          maxWidth: '1200px'
        }}>
          {/* First Row - 3 Cards */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
            mb: 3,
            height: '200px'
          }}>
            {dashboardSections.slice(0, 3).map((section, index) => (
                <Paper
                  key={section.id}
                  className="section-card"
                  onClick={() => onSectionClick('section-' + section.id)}
                  sx={{
                    background: section.gradient,
                    color: 'white',
                    cursor: 'pointer',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animationDelay: `${index * 0.1}s`,
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 12px 40px ${section.color}40`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box sx={{ fontSize: 40, opacity: 0.9 }}>
                      {section.icon}
                    </Box>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '1.4rem',
                    fontWeight: 700, 
                    textAlign: 'center',
                    mb: 2,
                    letterSpacing: '0.5px'
                  }}>
                    {section.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip 
                      label={`${section.reports.length} Reports`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                    <IconButton 
                      size="small"
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Second Row - 2 Cards Centered */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 3,
              maxWidth: '800px',
              mx: 'auto',
              height: '200px'
            }}>
              {dashboardSections.slice(3, 5).map((section, index) => (
                <Paper
                  key={section.id}
                  className="section-card"
                  onClick={() => onSectionClick('section-' + section.id)}
                  sx={{
                    background: section.gradient,
                    color: 'white',
                    cursor: 'pointer',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animationDelay: `${(index + 3) * 0.1}s`,
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 12px 40px ${section.color}40`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box sx={{ fontSize: 40, opacity: 0.9 }}>
                      {section.icon}
                    </Box>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '1.4rem',
                    fontWeight: 700, 
                    textAlign: 'center',
                    mb: 2,
                    letterSpacing: '0.5px'
                  }}>
                    {section.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip 
                      label={`${section.reports.length} Reports`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                    <IconButton 
                      size="small"
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Mobile Layout */}
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: '400px',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {dashboardSections.map((section, index) => (
              <Paper
                key={`mobile-${section.id}`}
                className="section-card"
                onClick={() => onSectionClick('section-' + section.id)}
                sx={{
                  background: section.gradient,
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animationDelay: `${index * 0.1}s`,
                  height: '90px',
                  width: '100%',
                  maxWidth: '350px',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 12px 40px ${section.color}40`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                  <Box sx={{ fontSize: 32, opacity: 0.9 }}>
                    {section.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 700, 
                      letterSpacing: '0.5px',
                      mb: 0.5
                    }}>
                      {section.title}
                    </Typography>
                    <Chip 
                      label={`${section.reports.length} Reports`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 20
                      }}
                    />
                  </Box>
                  <IconButton 
                    size="small"
                    sx={{ 
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
        </Box>
      </Box>
    </Box>
  );
};

export default UnifiedDashboard;