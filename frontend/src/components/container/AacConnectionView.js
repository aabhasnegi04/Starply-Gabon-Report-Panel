import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, Grid, IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import ForestIcon from '@mui/icons-material/Forest';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AacConnectionView = ({ onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [containerNo, setContainerNo] = useState('');

  const handleExcelDownload = () => {
    if (!data || !data.length) return;

    const wb = XLSX.utils.book_new();
    
    const sheetData = data.map(item => ({
      'Container No': item.CONTAINER_NO || '',
      'Market Name': item.MARKETNAME || '',
      'Market Group': item.MARKETGROUP || '',
      'Forest': item.FOREST || '',
      'AAC': item.AAC || '',
      'Origin': item.ORIGIN || '',
      'Essence': item.ESSENCE || '',
      'Entry Time': item.ENTRYTIME || '',
      'Entry User': item.ENTRYUSER || '',
      'Loading Date': item.LOADING_DATE || '',
      'Status': item.ACTSTATUS || ''
    }));
    
    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, sheet, 'AAC Connection');

    XLSX.writeFile(wb, `AAC_Connection_${containerNo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const fetchData = async () => {
    if (!containerNo.trim()) {
      setError('Please enter a container number');
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
          procedure: 'proc_getforestAACconnection',
          parameters: {
            containerno: containerNo.trim(),
            user1: 'system' // Default user parameter
          }
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      if (!apiData.data || apiData.data.length === 0 || !apiData.data[0] || apiData.data[0].length === 0) {
        setError('No AAC connection data found for the specified container.');
        return;
      }

      // The stored procedure returns one result set with container forest link data
      setData(apiData.data[0]);
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return null;

    const uniqueForests = [...new Set(data.map(item => item.FOREST).filter(Boolean))].length;
    const uniqueMarkets = [...new Set(data.map(item => item.MARKETNAME).filter(Boolean))].length;
    const uniqueOrigins = [...new Set(data.map(item => item.ORIGIN).filter(Boolean))].length;
    const uniqueEssences = [...new Set(data.map(item => item.ESSENCE).filter(Boolean))].length;

    return {
      totalRecords: data.length,
      uniqueForests,
      uniqueMarkets,
      uniqueOrigins,
      uniqueEssences
    };
  };

  // Prepare chart data
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return null;

    // Forest distribution
    const forestCounts = {};
    data.forEach(item => {
      const forest = item.FOREST || 'Unknown';
      forestCounts[forest] = (forestCounts[forest] || 0) + 1;
    });

    // Origin distribution
    const originCounts = {};
    data.forEach(item => {
      const origin = item.ORIGIN || 'Unknown';
      originCounts[origin] = (originCounts[origin] || 0) + 1;
    });

    // Market Group distribution
    const marketGroupCounts = {};
    data.forEach(item => {
      const marketGroup = item.MARKETGROUP || 'Unknown';
      marketGroupCounts[marketGroup] = (marketGroupCounts[marketGroup] || 0) + 1;
    });

    return {
      forest: {
        labels: Object.keys(forestCounts),
        data: Object.values(forestCounts)
      },
      origin: {
        labels: Object.keys(originCounts),
        data: Object.values(originCounts)
      },
      marketGroup: {
        labels: Object.keys(marketGroupCounts),
        data: Object.values(marketGroupCounts)
      }
    };
  };

  // Get responsive values
  const isMobile = window.innerWidth < 768;
  const barThickness = isMobile ? 30 : undefined;
  const maxBarThickness = isMobile ? 50 : 60;
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
              <LinkIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Get AAC Connection
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Forest AAC connection data for container
              </Typography>
            </Box>
          </Box>

          {/* Container Number Input */}
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
            <TextField
              fullWidth
              label="Container Number"
              value={containerNo}
              onChange={(e) => setContainerNo(e.target.value)}
              placeholder="Enter container number"
              sx={{
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
              }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={fetchData}
              disabled={loading || !containerNo.trim()}
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
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <CircularProgress size={48} sx={{ color: '#1b4332', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading AAC connection data...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please wait while we fetch the data for container {containerNo}
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
                <LinkIcon />
                AAC Connection for Container {containerNo} ({data.length} records)
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
                  <LinkIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.totalRecords}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Records
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
                  <ForestIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
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
                    Unique Forests
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
                  <BusinessIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.uniqueMarkets}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Unique Markets
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
                  <LocationOnIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.uniqueOrigins}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Unique Origins
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
          {/* Forest Distribution Chart */}
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
                Forest Distribution
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
                  <Bar
                    key={`forest-chart-${containerNo}`}
                    data={{
                      labels: chartData.forest.labels,
                      datasets: [
                        {
                          label: 'Records Count',
                          data: chartData.forest.data,
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
                            text: 'Count',
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

          {/* Origin Distribution Chart */}
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
                Origin Distribution
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
                  key={`origin-chart-${containerNo}`}
                  data={{
                    labels: chartData.origin.labels,
                    datasets: [
                      {
                        data: chartData.origin.data,
                        backgroundColor: [
                          'rgba(27, 67, 50, 0.8)',
                          'rgba(45, 106, 79, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(5, 150, 105, 0.8)',
                          'rgba(4, 120, 87, 0.8)',
                        ],
                        borderColor: [
                          'rgba(27, 67, 50, 1)',
                          'rgba(45, 106, 79, 1)',
                          'rgba(34, 197, 94, 1)',
                          'rgba(16, 185, 129, 1)',
                          'rgba(5, 150, 105, 1)',
                          'rgba(4, 120, 87, 1)',
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
                            return `${context.label}: ${context.parsed} records (${percentage}%)`;
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

      {/* Data Table */}
      {data && data.length > 0 && (
        <Card sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
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
                    Container No
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Market Name
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Market Group
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Forest
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    AAC
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Origin
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Essence
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Entry User
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Loading Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
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
                      {row.CONTAINER_NO || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.MARKETNAME || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.MARKETGROUP || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.FOREST || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.AAC || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.ORIGIN || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.ESSENCE || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.ENTRYUSER || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                      {row.LOADING_DATE ? new Date(row.LOADING_DATE).toLocaleDateString() : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Empty State */}
      {data && data.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <LinkIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No AAC connection data found for container {containerNo}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try checking the container number or verify if the container exists in the system.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default AacConnectionView;