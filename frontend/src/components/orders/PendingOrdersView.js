import React, { useState, useEffect } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Tabs, Tab, IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

const PendingOrdersView = ({ onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleExcelDownload = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    // Detailed sheet
    if (data.details && data.details.length > 0) {
      const detailsSheet = XLSX.utils.json_to_sheet(
        data.details.map(order => ({
          'Order No': order.ORDERNO || '',
          'Client Name': order.Client_Name || '',
          'Market': order.MARKET || '',
          'Thickness': order.THICKNESS || '',
          'Length': order.LENGTH || '',
          'Width': order.WIDTH || '',
          'Order PCS': order.ORDER_PCS || 0,
          'Order CBM': order.ORDER_CBM || 0,
          'Loading PCS': order.LOADING_PCS || 0,
          'Loading CBM': order.LOADING_CBM || 0,
          'Pending PCS': order.LOADING_PENDING_PCS || 0,
          'Pending CBM': order.LOADING_PENDING_CBM || 0,
          'Order Date': order.ORDERDATE ? new Date(order.ORDERDATE).toLocaleDateString() : '',
          'Delivery Time': order.DELIVERY_TIME ? new Date(order.DELIVERY_TIME).toLocaleDateString() : '',
          'Delivery Month': order.DELIVERY_MONTH || ''
        }))
      );
      XLSX.utils.book_append_sheet(wb, detailsSheet, 'Pending Orders Detail');
    }

    // Summary sheet
    if (data.summary && data.summary.length > 0) {
      const summarySheet = XLSX.utils.json_to_sheet(
        data.summary.map(item => ({
          'Client Name': item.Client_Name || '',
          'Market': item.MARKET || '',
          'Order PCS': item.ORDER_PCS || 0,
          'Order CBM': item.ORDER_CBM || 0,
          'Loading PCS': item.LOADING_PCS || 0,
          'Loading CBM': item.LOADING_CBM || 0,
          'Pending PCS': item.LOADING_PENDING_PCS || 0,
          'Pending CBM': item.LOADING_PENDING_CBM || 0
        }))
      );
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary by Client');
    }

    XLSX.writeFile(wb, `Pending_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/order/pending`);
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      const details = apiData.data?.[0] || [];
      const summary = apiData.data?.[1] || [];

      if (details.length === 0) {
        setError('No pending orders found.');
        return;
      }

      setData({ details, summary });
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" gap={2}>
            <Box display="flex" alignItems="center">
              <Box sx={{ 
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                borderRadius: 2,
                p: 1.5,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PendingActionsIcon sx={{ fontSize: 28, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                  Pending Orders
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  View and export all pending orders
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
              sx={{
                minWidth: { xs: '100%', md: 'auto' },
                width: { xs: '100%', md: 'auto' },
                borderRadius: 2,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderColor: '#1b4332',
                color: '#1b4332',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#0f2419',
                  backgroundColor: 'rgba(27, 67, 50, 0.05)',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
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
                  <PendingActionsIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Pending Orders Found
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                    <Chip 
                      label={`${data.details.length} order${data.details.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        color: '#1b4332',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    />
                    <Chip 
                      label={`${data.summary.length - 1} client${data.summary.length - 1 !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        color: '#1b4332',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExcelDownload}
                sx={{
                  minWidth: 180,
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
            Loading pending orders...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1, border: '1px solid #f44336' }}>
          {error}
        </Alert>
      )}

      {/* Tabs and Tables */}
      {data && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid #e8f5e9' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: '#666',
                  '&.Mui-selected': {
                    color: '#1b4332',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1b4332',
                  height: 3,
                }
              }}
            >
              <Tab label="Detailed View" />
              <Tab label="Summary by Client" />
            </Tabs>
          </Box>

          {/* Detailed View */}
          {activeTab === 0 && (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    {['Order No', 'Client', 'Market', 'Size', 'Order PCS', 'Order CBM', 'Loading PCS', 'Loading CBM', 'Pending PCS', 'Pending CBM', 'Delivery Month'].map((header) => (
                      <TableCell key={header} sx={{ 
                        fontWeight: 700, 
                        textAlign: 'center', 
                        py: 2.5,
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)',
                      }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.details.map((order, index) => (
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
                      <TableCell sx={{ textAlign: 'center', py: 2, fontWeight: 600, color: '#1b4332', fontSize: '0.9rem' }}>
                        {order.ORDERNO || ''}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'left', py: 2, color: '#333', fontSize: '0.9rem' }}>
                        {order.Client_Name || ''}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 2, color: '#555', fontSize: '0.9rem' }}>
                        {order.MARKET || ''}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 2, color: '#555', fontSize: '0.85rem' }}>
                        {order.LENGTH}x{order.WIDTH}x{order.THICKNESS}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', py: 2, color: '#555', fontSize: '0.9rem' }}>
                        {order.ORDER_PCS?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', py: 2, color: '#555', fontSize: '0.9rem' }}>
                        {order.ORDER_CBM?.toFixed(2) || 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', py: 2, color: '#555', fontSize: '0.9rem' }}>
                        {order.LOADING_PCS?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', py: 2, color: '#555', fontSize: '0.9rem' }}>
                        {order.LOADING_CBM?.toFixed(2) || 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', py: 2, fontWeight: 600, color: '#d32f2f', fontSize: '0.9rem' }}>
                        {order.LOADING_PENDING_PCS?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', py: 2, fontWeight: 600, color: '#d32f2f', fontSize: '0.9rem' }}>
                        {order.LOADING_PENDING_CBM?.toFixed(2) || 0}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 2 }}>
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
          )}

          {/* Summary View */}
          {activeTab === 1 && (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
                    {['Client Name', 'Market', 'Order PCS', 'Order CBM', 'Loading PCS', 'Loading CBM', 'Pending PCS', 'Pending CBM'].map((header) => (
                      <TableCell key={header} sx={{ 
                        fontWeight: 700, 
                        textAlign: 'center', 
                        py: 2.5,
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)',
                      }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.summary.map((item, index) => {
                    const isGrandTotal = item.Client_Name === 'GRAND TOTAL';
                    return (
                      <TableRow 
                        key={index}
                        sx={{
                          backgroundColor: isGrandTotal ? '#1b4332' : (index % 2 === 0 ? '#ffffff' : '#f8faf9'),
                          '&:hover': {
                            backgroundColor: isGrandTotal ? '#0f2419' : '#e8f5e9',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <TableCell sx={{ 
                          textAlign: 'left', 
                          py: 2, 
                          fontWeight: isGrandTotal ? 700 : 500, 
                          color: isGrandTotal ? '#ffffff' : '#333', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.Client_Name || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'center', 
                          py: 2, 
                          color: isGrandTotal ? '#ffffff' : '#555', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.MARKET || '-'}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          py: 2, 
                          fontWeight: isGrandTotal ? 700 : 500,
                          color: isGrandTotal ? '#ffffff' : '#555', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.ORDER_PCS?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          py: 2, 
                          fontWeight: isGrandTotal ? 700 : 500,
                          color: isGrandTotal ? '#ffffff' : '#555', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.ORDER_CBM?.toFixed(2) || 0}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          py: 2, 
                          fontWeight: isGrandTotal ? 700 : 500,
                          color: isGrandTotal ? '#ffffff' : '#555', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.LOADING_PCS?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          py: 2, 
                          fontWeight: isGrandTotal ? 700 : 500,
                          color: isGrandTotal ? '#ffffff' : '#555', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.LOADING_CBM?.toFixed(2) || 0}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          py: 2, 
                          fontWeight: 700,
                          color: isGrandTotal ? '#ffeb3b' : '#d32f2f', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.LOADING_PENDING_PCS?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          py: 2, 
                          fontWeight: 700,
                          color: isGrandTotal ? '#ffeb3b' : '#d32f2f', 
                          fontSize: '0.9rem' 
                        }}>
                          {item.LOADING_PENDING_CBM?.toFixed(2) || 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
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
            <PendingActionsIcon sx={{ fontSize: 50, color: '#1b4332' }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1b4332', fontWeight: 700, mb: 1 }}>
            No Pending Orders
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
            All orders have been completed
          </Typography>
        </Card>
      )}
    </Container>
  );
};

export default PendingOrdersView;
