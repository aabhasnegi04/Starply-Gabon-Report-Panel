import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

const OrderListDeliveryView = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleExcelDownload = () => {
    if (!data || !data.orders.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      data.orders.map(order => ({
        'Work Order No': order.Work_OrderNo || '',
        'Client Name': order.Client_Name || '',
        'Contract Date': order.Contract_Date ? new Date(order.Contract_Date).toLocaleDateString() : '',
        'Delivery Time': order.DELIVERY_TIME ? new Date(order.DELIVERY_TIME).toLocaleDateString() : '',
        'Delivery Month': order.DELIVERY_MONTH || ''
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Order List Delivery');
    XLSX.writeFile(workbook, `Order_List_Delivery_${fromDate.format('YYYY-MM-DD')}_to_${toDate.format('YYYY-MM-DD')}.xlsx`);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/order/listbydeliverydate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          from_date: fromDate.format('YYYY-MM-DD'), 
          to_date: toDate.format('YYYY-MM-DD') 
        })
      });
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      const orders = apiData.data?.[0] || [];
      const orderDetails = apiData.data?.[1] || [];

      if (orders.length === 0) {
        setError('No orders found for this delivery date range.');
        return;
      }

      setData({ orders, orderDetails });
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4, px: { xs: 1, md: 2 } }}>
      {/* Search Card */}
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
              <LocalShippingIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Order List - Delivery Date Wise
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Search and export orders by delivery date range
              </Typography>
            </Box>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
              <DatePicker
                label="From Delivery Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
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
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(27, 67, 50, 0.15)',
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: '#1b4332',
                          '&:hover': {
                            backgroundColor: '#0f2419',
                          },
                        },
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#1b4332',
                      },
                    }
                  }
                }}
              />
              <DatePicker
                label="To Delivery Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                minDate={fromDate}
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
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(27, 67, 50, 0.15)',
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: '#1b4332',
                          '&:hover': {
                            backgroundColor: '#0f2419',
                          },
                        },
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#1b4332',
                      },
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                disabled={loading || !fromDate || !toDate}
                onClick={handleSearch}
                sx={{
                  minWidth: { xs: '100%', md: 160 },
                  width: { xs: '100%', md: 'auto' },
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                  color: 'white',
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

      {/* Results Header with Download Button */}
      {data && (
        <Card sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          boxShadow: '0 4px 12px rgba(27, 67, 50, 0.2)',
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ListAltIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Orders Found
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                    <Chip 
                      label={`${data.orders.length} order${data.orders.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        color: '#1b4332',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {fromDate?.format('MMM DD, YYYY')} to {toDate?.format('MMM DD, YYYY')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExcelDownload}
                sx={{
                  minWidth: { xs: '100%', md: 180 },
                  width: { xs: '100%', md: 'auto' },
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#1b4332',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    background: '#f1f8f4',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Download Excel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box textAlign="center" py={8}>
          <CircularProgress size={50} sx={{ color: '#1b4332' }} />
          <Typography variant="body1" sx={{ mt: 2, color: '#666', fontWeight: 500 }}>
            Searching orders...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1, border: '1px solid #f44336' }}>
          {error}
        </Alert>
      )}

      {/* Beautiful Table */}
      {data && (
        <>
          <Typography 
            variant="caption" 
            sx={{ 
              display: { xs: 'block', md: 'none' }, 
              textAlign: 'center', 
              color: '#666', 
              mb: 1,
              fontStyle: 'italic'
            }}
          >
            ← Swipe left to see all columns →
          </Typography>
          <Box sx={{ mb: 4, width: '100%', overflowX: 'auto' }}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e8f5e9'
            }}
          >
            <Table sx={{ minWidth: 650, width: '100%' }}>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)',
                }}>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 2.5,
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    Work Order No
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 2.5,
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    Client Name
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 2.5,
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    Contract Date
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 2.5,
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    Delivery Time
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 2.5,
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Delivery Month
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.orders.map((order, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8faf9',
                      '&:hover': {
                        backgroundColor: '#e8f5e9',
                        transform: 'scale(1.001)',
                        boxShadow: '0 2px 8px rgba(27, 67, 50, 0.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ 
                      textAlign: 'center',
                      py: 2,
                      fontWeight: 600,
                      color: '#1b4332',
                      fontSize: '0.9rem',
                      borderRight: '1px solid #e0e0e0'
                    }}>
                      {order.Work_OrderNo || ''}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'left',
                      py: 2,
                      color: '#333',
                      fontSize: '0.9rem',
                      borderRight: '1px solid #e0e0e0'
                    }}>
                      {order.Client_Name || ''}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      py: 2,
                      color: '#555',
                      fontSize: '0.9rem',
                      borderRight: '1px solid #e0e0e0'
                    }}>
                      {order.Contract_Date ? new Date(order.Contract_Date).toLocaleDateString() : ''}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      py: 2,
                      color: '#555',
                      fontSize: '0.9rem',
                      borderRight: '1px solid #e0e0e0'
                    }}>
                      {order.DELIVERY_TIME ? new Date(order.DELIVERY_TIME).toLocaleDateString() : ''}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      py: 2,
                      fontWeight: 600,
                      color: '#1b4332',
                      fontSize: '0.9rem'
                    }}>
                      <Chip 
                        label={order.DELIVERY_MONTH || ''}
                        size="small"
                        sx={{
                          backgroundColor: '#e8f5e9',
                          color: '#1b4332',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        </>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <Card sx={{ 
          p: 8, 
          textAlign: 'center', 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '2px dashed #d0e8d5'
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            borderRadius: '50%',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3
          }}>
            <LocalShippingIcon sx={{ fontSize: 50, color: '#1b4332' }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1b4332', fontWeight: 700, mb: 1 }}>
            No Orders to Display
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
            Select a delivery date range above and click Search to view orders
          </Typography>
        </Card>
      )}
    </Container>
  );
};

export default OrderListDeliveryView;
