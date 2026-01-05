import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Grid, IconButton, Tabs, Tab
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const ContainerLoadingView = ({ onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExcelDownload = () => {
    if (!data || !data.length) return;

    const wb = XLSX.utils.book_new();

    // Client Summary Sheet
    if (data[0] && data[0].length > 0) {
      const clientSummaryData = data[0].map(item => ({
        'Client Name': item.Client_Name || '',
        'MTD Containers': item.MTD_CONTAINER || 0,
        'Previous Month Containers': item.PREVMONTH_CONTAINER || 0,
        'Growth': (item.MTD_CONTAINER || 0) - (item.PREVMONTH_CONTAINER || 0),
        'Growth %': item.PREVMONTH_CONTAINER > 0 
          ? (((item.MTD_CONTAINER || 0) - (item.PREVMONTH_CONTAINER || 0)) / item.PREVMONTH_CONTAINER * 100).toFixed(2) + '%'
          : 'N/A'
      }));
      
      const clientSheet = XLSX.utils.json_to_sheet(clientSummaryData);
      XLSX.utils.book_append_sheet(wb, clientSheet, 'Client Summary');
    }

    // Monthly Loading Sheet
    if (data[1] && data[1].length > 0) {
      const monthlyData = data[1].map(item => ({
        'Loading Month': item.LOADING_MONTH || '',
        'Month': item.MONTHS || '',
        'Container Count': item.NO_OF_CONTAINER_2025 || 0
      }));
      
      const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlySheet, 'Monthly Loading');
    }

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Container_Loading_Client_Wise_${dateStr}.xlsx`);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/order/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedure: 'proc_get_summary_container',
          parameters: {}
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      if (!apiData.data || apiData.data.length === 0) {
        setError('No container loading data found.');
        return;
      }

      setData(apiData.data);
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toLocaleString('en-IN');
  };

  // Calculate summary statistics
  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return null;

    const clientData = data[0] || [];
    const monthlyData = data[1] || [];

    const totalMTDContainers = clientData.reduce((sum, item) => sum + (parseFloat(item.MTD_CONTAINER) || 0), 0);
    const totalPrevMonthContainers = clientData.reduce((sum, item) => sum + (parseFloat(item.PREVMONTH_CONTAINER) || 0), 0);
    const totalYearlyContainers = monthlyData.reduce((sum, item) => sum + (parseFloat(item.NO_OF_CONTAINER_2025) || 0), 0);
    
    const growthContainers = totalMTDContainers - totalPrevMonthContainers;
    const growthPercentage = totalPrevMonthContainers > 0 
      ? ((growthContainers / totalPrevMonthContainers) * 100) 
      : 0;

    const activeClients = clientData.filter(item => (parseFloat(item.MTD_CONTAINER) || 0) > 0).length;
    const totalClients = clientData.length;

    return {
      totalMTDContainers,
      totalPrevMonthContainers,
      totalYearlyContainers,
      growthContainers,
      growthPercentage,
      activeClients,
      totalClients
    };
  };

  // Prepare chart data
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return null;

    const clientData = data[0] || [];
    const monthlyData = data[1] || [];

    // Sort clients by MTD containers (top 10)
    const sortedClients = [...clientData]
      .sort((a, b) => (parseFloat(b.MTD_CONTAINER) || 0) - (parseFloat(a.MTD_CONTAINER) || 0))
      .slice(0, 10);

    // Sort monthly data by month order
    const monthOrder = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };

    const sortedMonthlyData = [...monthlyData].sort((a, b) => {
      const monthA = monthOrder[a.MONTHS] || 13;
      const monthB = monthOrder[b.MONTHS] || 13;
      return monthA - monthB;
    });

    // Client performance categories
    const growthClients = clientData.filter(item => 
      (parseFloat(item.MTD_CONTAINER) || 0) > (parseFloat(item.PREVMONTH_CONTAINER) || 0)
    ).length;
    
    const declineClients = clientData.filter(item => 
      (parseFloat(item.MTD_CONTAINER) || 0) < (parseFloat(item.PREVMONTH_CONTAINER) || 0)
    ).length;
    
    const stableClients = clientData.filter(item => 
      (parseFloat(item.MTD_CONTAINER) || 0) === (parseFloat(item.PREVMONTH_CONTAINER) || 0)
    ).length;

    return {
      topClients: {
        labels: sortedClients.map(item => item.Client_Name || 'Unknown'),
        mtdData: sortedClients.map(item => parseFloat(item.MTD_CONTAINER) || 0),
        prevData: sortedClients.map(item => parseFloat(item.PREVMONTH_CONTAINER) || 0)
      },
      monthlyTrend: {
        labels: sortedMonthlyData.map(item => item.MONTHS || ''),
        data: sortedMonthlyData.map(item => parseFloat(item.NO_OF_CONTAINER_2025) || 0)
      },
      clientPerformance: {
        labels: ['Growth', 'Decline', 'Stable'],
        data: [growthClients, declineClients, stableClients]
      }
    };
  };

  // Get responsive values
  const isMobile = window.innerWidth < 768;
  const barThickness = isMobile ? 25 : undefined;
  const maxBarThickness = isMobile ? 40 : 50;
  const fontSize = isMobile ? 10 : 12;
  const tickFontSize = isMobile ? 9 : 11;

  const summaryStats = data ? calculateSummaryStats(data) : null;
  const chartData = data ? prepareChartData(data) : null;

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4, px: { xs: 1, md: 2 } }}>
      {/* Header Card */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(27, 67, 50, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faf9 100%)',
        border: '1px solid #e8f5e9'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            {onBackClick && (
              <IconButton 
                onClick={onBackClick}
                sx={{ 
                  mr: 2, 
                  color: '#1b4332',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LocalShippingIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Container Loading - Client Wise
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Client-wise container loading summary and trends
              </Typography>
            </Box>
          </Box>

          {/* Fetch Button */}
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={fetchData}
              disabled={loading}
              sx={{
                minWidth: 200,
                borderRadius: 2,
                fontSize: '0.95rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                color: '#ffffff',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(27, 67, 50, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0f2419 0%, #1b4332 100%)',
                  boxShadow: '0 6px 16px rgba(27, 67, 50, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Load Container Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <CircularProgress size={48} sx={{ color: '#1b4332', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading container loading data...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please wait while we fetch the client-wise container data
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontSize: '0.95rem'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Results Header with Download Button */}
      {data && (
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)',
          boxShadow: '0 4px 12px rgba(255, 183, 77, 0.3)'
        }}>
          <CardContent sx={{ py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography variant="h6" sx={{ 
                color: '#ffffff', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <LocalShippingIcon />
                Container Loading Summary ({data ? data.length : 0} datasets)
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExcelDownload}
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#ffa726',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Download Excel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Cards */}
      {summaryStats && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <LocalShippingIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalMTDContainers)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    MTD Containers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: summaryStats.growthContainers >= 0 
                  ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  {summaryStats.growthContainers >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  )}
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.growthPercentage >= 0 ? '+' : ''}{summaryStats.growthPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Growth Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <BusinessIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.activeClients}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Active Clients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                color: 'white',
                height: { xs: '140px', md: '140px' },
                width: '100%'
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <CalendarTodayIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalYearlyContainers)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Yearly Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Charts Section */}
      {chartData && (
        <Box sx={{ mb: 4 }}>
          {/* Top Clients Comparison Chart */}
          <Card sx={{ 
            borderRadius: 2, 
            height: { xs: '300px', md: '400px' }, 
            mb: 3,
            mx: 'auto',
            maxWidth: '100%'
          }}>
            <CardContent sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: '#1b4332',
                textAlign: 'center',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Top 10 Clients - MTD vs Previous Month
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 40px)',
                overflowX: { xs: 'auto', md: 'visible' },
                overflowY: 'hidden',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}>
                <Box sx={{ 
                  minWidth: { xs: '900px', md: '100%' },
                  height: '100%'
                }}>
                  <Bar
                    key={`clients-chart`}
                    data={{
                      labels: chartData.topClients.labels,
                      datasets: [
                        {
                          label: 'MTD Containers',
                          data: chartData.topClients.mtdData,
                          backgroundColor: 'rgba(27, 67, 50, 0.8)',
                          borderColor: 'rgba(27, 67, 50, 1)',
                          borderWidth: 1,
                          barThickness: barThickness,
                          maxBarThickness: maxBarThickness,
                        },
                        {
                          label: 'Previous Month',
                          data: chartData.topClients.prevData,
                          backgroundColor: 'rgba(45, 106, 79, 0.8)',
                          borderColor: 'rgba(45, 106, 79, 1)',
                          borderWidth: 1,
                          barThickness: barThickness,
                          maxBarThickness: maxBarThickness,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            font: {
                              size: fontSize
                            }
                          }
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Container Count',
                            font: {
                              size: fontSize
                            }
                          },
                          ticks: {
                            font: {
                              size: tickFontSize
                            }
                          }
                        },
                        x: {
                          ticks: {
                            font: {
                              size: tickFontSize
                            },
                            maxRotation: 45
                          }
                        }
                      },
                      layout: {
                        padding: {
                          left: isMobile ? 5 : 10,
                          right: isMobile ? 5 : 10,
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Monthly Trend Chart */}
          <Card sx={{ 
            borderRadius: 2, 
            height: { xs: '300px', md: '400px' }, 
            mb: 3,
            mx: 'auto',
            maxWidth: '100%'
          }}>
            <CardContent sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: '#1b4332',
                textAlign: 'center',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Monthly Container Loading Trend (Current Year)
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 40px)',
                overflowX: { xs: 'auto', md: 'visible' },
                overflowY: 'hidden',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}>
                <Box sx={{ 
                  minWidth: { xs: '600px', md: '100%' },
                  height: '100%'
                }}>
                  <Line
                    key={`monthly-trend-chart`}
                    data={{
                      labels: chartData.monthlyTrend.labels,
                      datasets: [
                        {
                          label: 'Container Count',
                          data: chartData.monthlyTrend.data,
                          borderColor: 'rgba(255, 183, 77, 1)',
                          backgroundColor: 'rgba(255, 183, 77, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: 'rgba(255, 183, 77, 1)',
                          pointBorderColor: 'rgba(255, 183, 77, 1)',
                          pointRadius: 6,
                          pointHoverRadius: 8,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Container Count',
                            font: {
                              size: fontSize
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          },
                          ticks: {
                            font: {
                              size: tickFontSize
                            }
                          }
                        },
                        x: {
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          },
                          ticks: {
                            font: {
                              size: tickFontSize
                            }
                          }
                        },
                      },
                      elements: {
                        point: {
                          hoverBackgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      },
                      layout: {
                        padding: {
                          left: isMobile ? 5 : 10,
                          right: isMobile ? 5 : 10,
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Client Performance Distribution */}
          <Card sx={{ 
            borderRadius: 2, 
            height: { xs: '300px', md: '400px' }, 
            mb: 3,
            mx: 'auto',
            maxWidth: '100%'
          }}>
            <CardContent sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: '#1b4332',
                textAlign: 'center',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Client Performance Distribution
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 40px)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                maxWidth: { xs: '250px', md: '350px' },
                mx: 'auto'
              }}>
                <Doughnut
                  key={`performance-chart`}
                  data={{
                    labels: chartData.clientPerformance.labels,
                    datasets: [
                      {
                        data: chartData.clientPerformance.data,
                        backgroundColor: [
                          'rgba(16, 185, 129, 0.8)',   // Green for Growth
                          'rgba(239, 68, 68, 0.8)',    // Red for Decline
                          'rgba(107, 114, 128, 0.8)',  // Gray for Stable
                        ],
                        borderColor: [
                          'rgba(16, 185, 129, 1)',
                          'rgba(239, 68, 68, 1)',
                          'rgba(107, 114, 128, 1)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: fontSize
                          },
                          padding: isMobile ? 10 : 20
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} clients (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Data Tables with Tabs */}
      {data && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Client Summary" />
              <Tab label="Monthly Loading" />
            </Tabs>
          </Box>

          {/* Client Summary Table */}
          <TabPanel value={tabValue} index={0}>
            {data[0] && data[0].length > 0 && (
              <TableContainer sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Client Name
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        MTD Containers
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Previous Month
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Growth
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Growth %
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data[0].map((row, index) => {
                      const growth = (parseFloat(row.MTD_CONTAINER) || 0) - (parseFloat(row.PREVMONTH_CONTAINER) || 0);
                      const growthPercent = (parseFloat(row.PREVMONTH_CONTAINER) || 0) > 0 
                        ? (growth / (parseFloat(row.PREVMONTH_CONTAINER) || 0)) * 100 
                        : 0;
                      
                      return (
                        <TableRow 
                          key={index}
                          sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                            '&:hover': { 
                              backgroundColor: '#e8f5e9',
                              transition: 'background-color 0.2s ease'
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            borderBottom: '1px solid #e0e0e0'
                          }}>
                            {row.Client_Name || ''}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                            {formatNumber(row.MTD_CONTAINER)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                            {formatNumber(row.PREVMONTH_CONTAINER)}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.9rem', 
                            borderBottom: '1px solid #e0e0e0',
                            color: growth >= 0 ? '#059669' : '#dc2626',
                            fontWeight: 500
                          }}>
                            {growth >= 0 ? '+' : ''}{formatNumber(growth)}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.9rem', 
                            borderBottom: '1px solid #e0e0e0',
                            color: growthPercent >= 0 ? '#059669' : '#dc2626',
                            fontWeight: 500
                          }}>
                            {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Monthly Loading Table */}
          <TabPanel value={tabValue} index={1}>
            {data[1] && data[1].length > 0 && (
              <TableContainer sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Loading Month
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Month
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: '#1b4332', 
                        color: '#ffffff', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderBottom: 'none'
                      }}>
                        Container Count
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data[1].map((row, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                          '&:hover': { 
                            backgroundColor: '#e8f5e9',
                            transition: 'background-color 0.2s ease'
                          }
                        }}
                      >
                        <TableCell sx={{ 
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          borderBottom: '1px solid #e0e0e0'
                        }}>
                          {row.LOADING_MONTH || ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {row.MONTHS || ''}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                          {formatNumber(row.NO_OF_CONTAINER_2025)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Card>
      )}

      {/* Empty State */}
      {data && data.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <LocalShippingIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No container loading data found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try refreshing the data or check if containers are available in the system.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ContainerLoadingView;