import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Grid, IconButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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

const ContainerMonthWiseView = ({ onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleExcelDownload = () => {
    if (!data || !data.length) return;

    const wb = XLSX.utils.book_new();
    
    const excelData = data.map(item => ({
      'Loading Month': item.LOADING_MONTH || '',
      'Month': item.MONTHS || '',
      'Number of Containers': item.NO_OF_CONTAINER || 0
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Container Month Wise');
    
    XLSX.writeFile(wb, `Container_Month_Wise_${selectedYear}.xlsx`);
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
          procedure: 'proc_getcontainersumyear',
          parameters: {
            year: selectedYear
          }
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      if (!apiData.data || apiData.data.length === 0) {
        setError('No container data found for the selected year.');
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

    const totalContainers = data.reduce((sum, item) => sum + (parseFloat(item.NO_OF_CONTAINER) || 0), 0);
    const avgContainersPerMonth = totalContainers / data.length;
    
    // Find peak month
    const peakMonth = data.reduce((max, item) => 
      (parseFloat(item.NO_OF_CONTAINER) || 0) > (parseFloat(max.NO_OF_CONTAINER) || 0) ? item : max
    , data[0] || {});

    // Find lowest month
    const lowestMonth = data.reduce((min, item) => 
      (parseFloat(item.NO_OF_CONTAINER) || 0) < (parseFloat(min.NO_OF_CONTAINER) || 0) ? item : min
    , data[0] || {});

    // Calculate quarterly data
    const quarters = {
      Q1: data.filter(item => ['Jan', 'Feb', 'Mar'].includes(item.MONTHS)),
      Q2: data.filter(item => ['Apr', 'May', 'Jun'].includes(item.MONTHS)),
      Q3: data.filter(item => ['Jul', 'Aug', 'Sep'].includes(item.MONTHS)),
      Q4: data.filter(item => ['Oct', 'Nov', 'Dec'].includes(item.MONTHS))
    };

    const quarterlyTotals = Object.keys(quarters).map(quarter => ({
      quarter,
      total: quarters[quarter].reduce((sum, item) => sum + (parseFloat(item.NO_OF_CONTAINER) || 0), 0)
    }));

    const bestQuarter = quarterlyTotals.reduce((max, item) => 
      item.total > max.total ? item : max
    , quarterlyTotals[0] || {});

    // Calculate year trend (simple calculation based on first vs last available data)
    const firstMonthData = data[0];
    const lastMonthData = data[data.length - 1];
    const trendPercentage = firstMonthData && lastMonthData ? 
      ((parseFloat(lastMonthData.NO_OF_CONTAINER) - parseFloat(firstMonthData.NO_OF_CONTAINER)) / parseFloat(firstMonthData.NO_OF_CONTAINER)) * 100 : 0;

    return {
      totalContainers,
      avgContainersPerMonth: avgContainersPerMonth.toFixed(1),
      peakMonth: peakMonth?.MONTHS || 'N/A',
      peakContainers: peakMonth?.NO_OF_CONTAINER || 0,
      lowestMonth: lowestMonth?.MONTHS || 'N/A',
      lowestContainers: lowestMonth?.NO_OF_CONTAINER || 0,
      bestQuarter: bestQuarter?.quarter || 'N/A',
      bestQuarterTotal: bestQuarter?.total || 0,
      quarterlyTotals,
      trendPercentage: trendPercentage || 0,
      activeMonths: data.length
    };
  };

  // Prepare chart data
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return null;

    // Sort data by month order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sortedData = [...data].sort((a, b) => 
      monthOrder.indexOf(a.MONTHS) - monthOrder.indexOf(b.MONTHS)
    );

    const labels = sortedData.map(item => item.MONTHS);
    const containerCounts = sortedData.map(item => parseFloat(item.NO_OF_CONTAINER) || 0);

    // Calculate trend (growth/decline from previous month)
    const trends = containerCounts.map((current, index) => {
      if (index === 0) return 0;
      const previous = containerCounts[index - 1];
      return previous === 0 ? 0 : ((current - previous) / previous) * 100;
    });

    // Performance categories
    const avgContainers = containerCounts.reduce((sum, val) => sum + val, 0) / containerCounts.length;
    const highPerformance = containerCounts.filter(count => count > avgContainers * 1.2).length;
    const averagePerformance = containerCounts.filter(count => count >= avgContainers * 0.8 && count <= avgContainers * 1.2).length;
    const lowPerformance = containerCounts.filter(count => count < avgContainers * 0.8).length;

    // Quarterly data
    const quarters = {
      'Q1 (Jan-Mar)': containerCounts.slice(0, 3).reduce((sum, val) => sum + val, 0),
      'Q2 (Apr-Jun)': containerCounts.slice(3, 6).reduce((sum, val) => sum + val, 0),
      'Q3 (Jul-Sep)': containerCounts.slice(6, 9).reduce((sum, val) => sum + val, 0),
      'Q4 (Oct-Dec)': containerCounts.slice(9, 12).reduce((sum, val) => sum + val, 0)
    };

    return {
      monthly: {
        labels,
        data: containerCounts,
        trends
      },
      performance: {
        labels: ['High Performance', 'Average Performance', 'Low Performance'],
        data: [highPerformance, averagePerformance, lowPerformance]
      },
      quarterly: {
        labels: Object.keys(quarters),
        data: Object.values(quarters)
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

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

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
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
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
                Container Month Wise
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Monthly container loading analysis for {selectedYear}
              </Typography>
            </Box>
          </Box>

          {/* Year Selection */}
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel>Select Year</InputLabel>
              <Select
                value={selectedYear}
                label="Select Year"
                onChange={(e) => setSelectedYear(e.target.value)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1b4332',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1b4332',
                    borderWidth: '2px',
                  },
                }}
              >
                {yearOptions.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={fetchData}
              disabled={loading}
              sx={{
                minWidth: { xs: '100%', md: 160 },
                width: { xs: '100%', md: 'auto' },
                borderRadius: 2,
                fontSize: '0.95rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                color: '#ffffff',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d47a1 0%, #01579b 100%)',
                  boxShadow: '0 6px 16px rgba(21, 101, 192, 0.4)',
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
            <CircularProgress size={48} sx={{ color: '#1565c0', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Loading container data...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please wait while we analyze container data for {selectedYear}
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
                Container Data for {selectedYear} ({data.length} months)
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
                    {formatNumber(summaryStats.totalContainers)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Total Containers
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
                  <BarChartIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {formatNumber(summaryStats.avgContainersPerMonth)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Monthly Average
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: summaryStats.trendPercentage >= 0 
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
                  <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.2rem', md: '2rem' },
                    lineHeight: 1.2
                  }}>
                    {summaryStats.trendPercentage >= 0 ? '+' : ''}{summaryStats.trendPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Year Trend
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
                    {summaryStats.activeMonths}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.7rem', md: '0.875rem' }
                  }}>
                    Active Months
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
          {/* Monthly Container Chart */}
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
                Monthly Container Loading ({selectedYear})
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
                  minWidth: { xs: '700px', md: '100%' },
                  height: '100%'
                }}>
                  <Bar
                    key={`monthly-chart-${selectedYear}`}
                    data={{
                      labels: chartData.monthly.labels,
                      datasets: [
                        {
                          label: 'Container Count',
                          data: chartData.monthly.data,
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

          {/* Monthly Trend Line Chart */}
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
                Container Loading Trend ({selectedYear})
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
                  minWidth: { xs: '700px', md: '100%' },
                  height: '100%'
                }}>
                  <Line
                    key={`trend-chart-${selectedYear}`}
                    data={{
                      labels: chartData.monthly.labels,
                      datasets: [
                        {
                          label: 'Container Count',
                          data: chartData.monthly.data,
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

          {/* Quarterly Distribution */}
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
                Quarterly Distribution ({selectedYear})
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
                  key={`quarterly-chart-${selectedYear}`}
                  data={{
                    labels: chartData.quarterly.labels,
                    datasets: [
                      {
                        data: chartData.quarterly.data,
                        backgroundColor: [
                          'rgba(27, 67, 50, 0.8)',    // Q1
                          'rgba(45, 106, 79, 0.8)',   // Q2
                          'rgba(34, 197, 94, 0.8)',   // Q3
                          'rgba(16, 185, 129, 0.8)',  // Q4
                        ],
                        borderColor: [
                          'rgba(27, 67, 50, 1)',
                          'rgba(45, 106, 79, 1)',
                          'rgba(34, 197, 94, 1)',
                          'rgba(16, 185, 129, 1)',
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
                            return `${context.label}: ${context.parsed} containers (${percentage}%)`;
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
                  <TableCell sx={{ 
                    backgroundColor: '#1b4332', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderBottom: 'none'
                  }}>
                    Performance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => {
                  const containerCount = parseFloat(row.NO_OF_CONTAINER) || 0;
                  const average = summaryStats ? summaryStats.avgContainersPerMonth : 0;
                  let performance = 'Medium';
                  let performanceColor = '#ffa726';
                  
                  if (containerCount > average * 1.2) {
                    performance = 'High';
                    performanceColor = '#4caf50';
                  } else if (containerCount < average * 0.8) {
                    performance = 'Low';
                    performanceColor = '#f44336';
                  }
                  
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
                        {row.LOADING_MONTH || ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                        {row.MONTHS || ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                        {formatNumber(row.NO_OF_CONTAINER)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.9rem', borderBottom: '1px solid #e0e0e0' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: performanceColor,
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 500
                          }}
                        >
                          {performance}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Empty State */}
      {data && data.length === 0 && (
        <Card sx={{ borderRadius: 2, textAlign: 'center', py: 8 }}>
          <CardContent>
            <LocalShippingIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No container data found for {selectedYear}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try selecting a different year or check if data exists for this period.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ContainerMonthWiseView;