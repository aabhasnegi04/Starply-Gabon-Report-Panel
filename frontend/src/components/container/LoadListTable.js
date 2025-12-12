import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const LoadListTable = ({ data }) => {
  const {
    mainRows,
    containerInfo,
    workOrderInfo
  } = data;

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const containerNo = containerInfo?.ContainerNo || '';
  const shippingLine = containerInfo?.Shipping_Line || '';
  const orderNo = containerInfo?.ORDERNO || workOrderInfo?.Work_OrderNo || '';
  const partyName = containerInfo?.CONSIGNEE || workOrderInfo?.Client_Name || '';

  // Transform rows to load list format - one row per pallet
  const loadListRows = mainRows.map(row => ({
    length: row.LENGTH,
    width: row.WIDTH,
    thickness: row.THICKNESS,
    pcs: row.PCS,
    palletNumber: row.LOTNUMBER || 0
  })).sort((a, b) => a.palletNumber - b.palletNumber);

  // Calculate total pallets
  const calculatedTotalPallets = loadListRows.length;

  // Dynamic scaling based on row count - optimize space usage
  const rowCount = loadListRows.length;
  
  // Calculate optimal scale to fill page better
  // For fewer rows: use larger fonts/spacing. For more rows: scale down gradually
  const getOptimalScale = () => {
    // A4 page height: ~277mm usable, header takes ~35mm, table needs space
    // Calculate based on available space vs needed space
    if (rowCount <= 12) return 1.3; // Larger for very few rows
    if (rowCount <= 18) return 1.15; // Slightly larger for 18 rows
    if (rowCount <= 25) return 1.0; // Normal size
    if (rowCount <= 32) return 0.75; // Scale down for 32 rows
    return 0.6; // Minimum for 32+ rows
  };

  const scaleFactor = getOptimalScale();
  
  const getScaledValue = (baseValue, minValue = baseValue * 0.5) => {
    return Math.max(baseValue * scaleFactor, minValue);
  };

  // Padding increases for smaller datasets to fill space
  const getPadding = () => {
    if (rowCount <= 12) return '15mm 10mm';
    if (rowCount <= 18) return '12mm 8mm';
    if (rowCount <= 25) return '8mm 6mm';
    if (rowCount <= 32) return '5mm 4mm';
    return '4mm 3mm';
  };

  // Spacing between sections - larger for fewer rows
  const getHeaderMargin = () => {
    if (rowCount <= 12) return 2.5;
    if (rowCount <= 18) return 2.0;
    if (rowCount <= 25) return 1.5;
    if (rowCount <= 32) return 1.0;
    return 0.8;
  };

  const containerPadding = getPadding();
  const headerFontSize = `${getScaledValue(1.3, 0.9)}rem`;
  const titleFontSize = `${getScaledValue(1.8, 1.2)}rem`;
  const headerMarginBottom = getHeaderMargin();
  const tableHeaderFontSize = `${getScaledValue(1.0, 0.65)}rem`;
  
  // Cell padding - larger for fewer rows to fill space
  const getTableHeaderPaddingY = () => {
    if (rowCount <= 12) return 1.2;
    if (rowCount <= 18) return 1.0;
    if (rowCount <= 25) return 0.7;
    if (rowCount <= 32) return 0.4;
    return 0.3;
  };
  
  const getTableDataPaddingY = () => {
    if (rowCount <= 12) return 0.9;
    if (rowCount <= 18) return 0.8;
    if (rowCount <= 25) return 0.5;
    if (rowCount <= 32) return 0.3;
    return 0.2;
  };

  const tableHeaderPaddingY = getTableHeaderPaddingY();
  const tableDataFontSize = `${getScaledValue(0.95, 0.6)}rem`;
  const tableDataPaddingY = getTableDataPaddingY();

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '210mm',
      height: 'auto',
      p: containerPadding,
      mx: 'auto',
      background: '#fff',
      boxSizing: 'border-box',
      '@media print': {
        minHeight: 'auto !important',
        height: 'auto !important',
        maxHeight: 'none !important',
        pageBreakAfter: 'auto !important',
        overflow: 'visible'
      }
    }}>
      {/* Date */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Typography sx={{ fontSize: `${getScaledValue(1.0, 0.65)}rem`, color: '#666', fontWeight: 500 }}>
          {currentDate}
        </Typography>
      </Box>

      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: headerMarginBottom }}>
        <Typography sx={{ 
          fontSize: titleFontSize, 
          fontWeight: 700, 
          color: '#000',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          CONTAINER LOADING PLAN
        </Typography>
      </Box>

      {/* Header Info */}
      <Box sx={{ 
        mb: headerMarginBottom,
        display: 'flex',
        flexDirection: 'column',
        gap: rowCount <= 18 ? 0.8 : 0.5
      }}>
        <Typography sx={{ fontSize: headerFontSize, fontWeight: 600, textAlign: 'left' }}>
          CONTAINER NUMBER : {containerNo} ({shippingLine})
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, fontWeight: 600, textAlign: 'left' }}>
          PARTY NAME / PO NO. : {partyName} / PO {orderNo}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, fontWeight: 600, textAlign: 'left' }}>
          TOTAL NUMBER OF PALLETS : {calculatedTotalPallets} PALLETS
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #000', width: '100%' }}>
        <Table sx={{ borderCollapse: 'collapse', width: '100%' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#ffb74d' }}>
              <TableCell sx={{ 
                border: '1px solid #000', 
                fontWeight: 700, 
                textAlign: 'center',
                py: tableHeaderPaddingY,
                fontSize: tableHeaderFontSize,
                px: 0.6
              }}>
                SIZE AND THICKNESS
              </TableCell>
              <TableCell sx={{ 
                border: '1px solid #000', 
                fontWeight: 700, 
                textAlign: 'center', 
                py: tableHeaderPaddingY, 
                fontSize: tableHeaderFontSize, 
                px: 0.6 
              }}>
                NO. OF PALLETS
              </TableCell>
              <TableCell sx={{ 
                border: '1px solid #000', 
                fontWeight: 700, 
                textAlign: 'center', 
                py: tableHeaderPaddingY, 
                fontSize: tableHeaderFontSize, 
                px: 0.6 
              }}>
                PCS. PER PALLET
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadListRows.map((row, index) => (
              <TableRow key={index} sx={{ backgroundColor: '#fff' }}>
                <TableCell sx={{ 
                  border: '1px solid #000', 
                  textAlign: 'left',
                  py: tableDataPaddingY,
                  fontSize: tableDataFontSize,
                  px: 0.6
                }}>
                  {row.length} X {row.width} X {row.thickness} MM
                </TableCell>
              <TableCell sx={{ 
                border: '1px solid #000', 
                textAlign: 'center',
                py: tableDataPaddingY,
                fontSize: tableDataFontSize,
                px: 0.6
                }}>
                  {row.palletNumber}
                </TableCell>
                <TableCell sx={{ 
                  border: '1px solid #000', 
                  textAlign: 'center',
                  py: tableDataPaddingY,
                  fontSize: tableDataFontSize,
                  px: 0.6
                }}>
                  {row.pcs}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LoadListTable;

