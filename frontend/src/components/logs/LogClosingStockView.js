import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Grid, Paper, Tabs, Tab
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import ForestIcon from '@mui/icons-material/Forest';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
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
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';
import dayjs from 'dayjs';

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

const LogClosingStockView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [asOnDate, setAsOnDate] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExcelDownload = () => {
    if (!data || !data.length) return;

    const wb = XLSX.utils.book_new();

    // Create sheets for each dataset
    const sheetNames = [
      'Forest & Quality Summary',
      'Forest Summary', 
      'Forest & Origin Summary',
      'Forest & AAC Summary',
      'Forest Origin Loading Summary',
      'Company & Certificate Summary',
      'Detailed Data'
    ];

    data.forEach((dataset, index) => {
      if (dataset && dataset.length > 0) {
        const sheetData = dataset.map(item => {
          const cleanItem = {};
          Object.keys(item).forEach(key => {
            cleanItem[key] = item[key] || '';
          });
          return cleanItem;
        });
        
        const sheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, sheet, sheetNames[index] || `Sheet ${index + 1}`);
      }
    });

    const dateStr = asOnDate ? asOnDate.format('YYYY-MM-DD') : 'current';
    XLSX.writeFile(wb, `Log_Closing_Stock_${dateStr}.xlsx`);
  };

  const fetchData = async () => {
    if (!asOnDate) {
      setError('Please select As On Date');
      return;
    }

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
          procedure: 'proc_rp_logstocknotcuttedX2',
          parameters: {
            dateofstk: asOnDate.format('YYYY-MM-DD')
          }
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      if (!apiData.data || apiData.data.length === 0) {
        setError('No data found for the selected date.');
        return;
      }

      setData(apiData.data);
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return null;

    // Use the detailed data (last recordset) for calculations
    const detailedData = data[data.length - 1] || [];
    
    const totalLogs = detailedData.length;
    const totalBordereauCBM = detailedData.reduce((sum, item) => sum + (parseFloat(item.CBM_BORDEREAU) || 0), 0);
    const totalActualCBM = detailedData.reduce((sum, item) => sum + (parseFloat(item.BORD_ACTUAL_CBM) || 0), 0);
    
    // Count unique forests, companies, qualities
    const uniqueForests = [...new Set(detailedData.map(item => item.FOREST).filter(Boolean))].length;
    const uniqueCompanies = [...new Set(detailedData.map(item => item.COMPANY).filter(Boolean))].length;
    const uniqueQualities = [...new Set(detailedData.map(item => item.QUALITY).filter(Boolean))].length;

    return {
      totalLogs,
      totalBordereauCBM,
      totalActualCBM,
      uniqueForests,
      uniqueCompanies,
      uniqueQualities,
      variance: totalActualCBM - totalBordereauCBM
    };
  };

  // Prepare chart data
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return null;

    // Forest & Quality Summary (first recordset)
    const forestQualityData = data[0] || [];
    const forestData = data[1] || [];
    const companyData = data[5] || [];

    // Filter out grand total rows for charts
    const filteredForestQuality = forestQualityData.filter(item => 
      item.FOREST && item.FOREST !== 'GRAND TOTAL' && item.FOREST.trim() !== 'GRAND TOTAL'
    );
    
    const filteredForest = forestData.filter(item => 
      item.FOREST && item.FOREST !== 'GRAND TOTAL' && item.FOREST.trim() !== 'GRAND TOTAL'
    );

    const filteredCompany = companyData.filter(item => 
      item.COMPANY && item.COMPANY !== 'GRAND TOTAL' && item.COMPANY.trim() !== 'GRAND TOTAL'
    );

    // Calculate FSC vs Non-FSC distribution
    let fscCount = 0;
    let nonFscCount = 0;

    filteredCompany.forEach(item => {
      const logCount = parseFloat(item.LOG_COUNT) || 0;
      const certificate = (item.CERTIFICATE || '').toString().trim().toUpperCase();
      
      // More specific FSC detection - only if it explicitly says "FSC 100%" or similar
      if (certificate === 'FSC 100%' || certificate === 'FSC100%' || certificate === 'FSC-100%') {
        fscCount += logCount;
      } else {
        nonFscCount += logCount;
      }
    });

    return {
      forestQuality: {
        labels: filteredForestQuality.map(item => `${item.FOREST} - ${item.QUALITY || 'N/A'}`),
        logCounts: filteredForestQuality.map(item => parseFloat(item.LOG_COUNT) || 0),
        bordereauCBM: filteredForestQuality.map(item => parseFloat(item.CBM_BORDEREAU) || 0),
        actualCBM: filteredForestQuality.map(item => parseFloat(item.BORD_ACTUAL_CBM) || 0)
      },
      forest: {
        labels: filteredForest.map(item => item.FOREST),
        logCounts: filteredForest.map(item => parseFloat(item.LOG_COUNT) || 0),
        bordereauCBM: filteredForest.map(item => parseFloat(item.CBM_BORDEREAU) || 0),
        actualCBM: filteredForest.map(item => parseFloat(item.BORD_ACTUAL_CBM) || 0)
      },
      fscDistribution: {
        labels: ['FSC 100%', 'Non-FSC'],
        logCounts: [fscCount, nonFscCount]
      }
    };
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Get responsive values
  const isMobile = window.innerWidth < 768;
  const barThickness = isMobile ? 40 : undefined;
  const maxBarThickness = isMobile ? 60 : 50;
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
            <Box sx={{ 
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <InventoryIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Log Closing Stock - As On Date
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Log inventory status as on selected date
              </Typography>
            </Box>
          </Box>

          {/* Date Filter */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
              <DatePicker
                label="As On Date"
                value={asOnDate}
                onChange={(newValue) => setAsOnDate(newValue)}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        '&:hover fieldset': {
                          borderColor: '#1b4332',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1b4332',
                          borderWidth: '2px',
                        },
                      },
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={fetchData}
                disabled={loading || !asOnDate}
                sx={{
                  minWidth: { xs: '100%', md: 160 },
                  width: { xs: '100%', md: 'auto' },
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
                Search
              </Button>
            </Box>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <CircularProgress size={48} sx={{ color: '#1b4332', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading log closing stock data...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please wait while we fetch the data for {asOnDate?.format('DD/MM/YYYY')}
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
                <InventoryIcon />
                Log Closing Stock as on {asOnDate?.format('DD/MM/YYYY')}
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
                  <ForestIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalLogs)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Logs
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
                    {summaryStats.uniqueForests}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Forests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
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
                  <InventoryIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.totalActualCBM)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total CBM
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: summaryStats.variance >= 0 
                  ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
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
                  <VerifiedIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.variance)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    CBM Variance
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
          {/* Forest-wise Log Count Chart */}
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
                Forest-wise Log Count Distribution
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
                    key={`forest-chart-${asOnDate?.format('YYYY-MM-DD')}`}
                    data={{
                      labels: chartData.forest.labels,
                      datasets: [
                        {
                          label: 'Log Count',
                          data: chartData.forest.logCounts,
                          backgroundColor: 'rgba(27, 67, 50, 0.8)',
                          borderColor: 'rgba(27, 67, 50, 1)',
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
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Log Count',
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
                            }
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

          {/* CBM Comparison Chart */}
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
                Forest-wise CBM Analysis
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
                    key={`cbm-chart-${asOnDate?.format('YYYY-MM-DD')}`}
                    data={{
                      labels: chartData.forest.labels,
                      datasets: [
                        {
                          label: 'Bordereau CBM',
                          data: chartData.forest.bordereauCBM,
                          backgroundColor: 'rgba(27, 67, 50, 0.8)',
                          borderColor: 'rgba(27, 67, 50, 1)',
                          borderWidth: 1,
                          barThickness: barThickness,
                          maxBarThickness: maxBarThickness,
                        },
                        {
                          label: 'Actual CBM',
                          data: chartData.forest.actualCBM,
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
                            text: 'CBM',
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
                            }
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

          {/* FSC Distribution Chart */}
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
                FSC Certification Distribution
              </Typography>
              <Box sx={{ 
                height: 'calc(100% - 40px)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                maxWidth: { xs: '250px', md: '350px' },
                mx: 'auto'
              }}>
                <Pie
                  key={`fsc-chart-${asOnDate?.format('YYYY-MM-DD')}`}
                  data={{
                    labels: chartData.fscDistribution.labels,
                    datasets: [
                      {
                        data: chartData.fscDistribution.logCounts,
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',   // Green for FSC 100%
                          'rgba(239, 68, 68, 0.8)',   // Red for Non-FSC
                        ],
                        borderColor: [
                          'rgba(34, 197, 94, 1)',     // Green border for FSC 100%
                          'rgba(239, 68, 68, 1)',     // Red border for Non-FSC
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
                            return `${context.label}: ${context.parsed} logs (${percentage}%)`;
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
              <Tab label="Forest & Quality" />
              <Tab label="Forest Summary" />
              <Tab label="Forest & Origin" />
              <Tab label="Forest & AAC" />
              <Tab label="Forest Origin Loading" />
              <Tab label="Company & Certificate" />
              <Tab label="Detailed Data" />
            </Tabs>
          </Box>

          {data.map((dataset, index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              {dataset && dataset.length > 0 && (
                <TableContainer sx={{ maxHeight: '70vh' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {Object.keys(dataset[0]).map((key) => (
                          <TableCell 
                            key={key}
                            sx={{ 
                              backgroundColor: '#1b4332', 
                              color: '#ffffff', 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              borderBottom: 'none'
                            }}
                          >
                            {key.replace(/_/g, ' ')}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataset.map((row, rowIndex) => (
                        <TableRow 
                          key={rowIndex}
                          sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                            '&:hover': { 
                              backgroundColor: '#e8f5e9',
                              transition: 'background-color 0.2s ease'
                            }
                          }}
                        >
                          {Object.entries(row).map(([key, value], cellIndex) => (
                            <TableCell 
                              key={cellIndex}
                              sx={{ 
                                fontSize: '0.9rem', 
                                borderBottom: '1px solid #e0e0e0',
                                fontWeight: (key.includes('TOTAL') || String(value).includes('GRAND TOTAL')) ? 600 : 400
                              }}
                            >
                              {key.includes('CBM') || key.includes('COUNT') ? formatNumber(value) : (value || '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          ))}
        </Card>
      )}

      {/* Empty State */}
      {data && data.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <InventoryIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No log closing stock data found for {asOnDate?.format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try selecting a different date or check if data exists for this period.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default LogClosingStockView;