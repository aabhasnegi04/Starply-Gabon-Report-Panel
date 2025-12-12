import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const MainListTable = ({ data }) => {
  const {
    workOrderInfo,
    mainRows,
    containerInfo
  } = data;

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const orderNo = containerInfo?.ORDERNO || workOrderInfo?.Work_OrderNo || '';
  const destination = containerInfo?.DESTINATION || workOrderInfo?.DESTINATION_PORTNAME || '';

  // Dynamic scaling based on row count to fit everything on one page
  // A4 page height: 297mm, available space after margins: ~277mm
  // Fixed header space: ~25mm, remaining for table: ~252mm
  const rowCount = mainRows.length;
  
  // Calculate scale factor based on row count
  // More aggressive scaling to utilize full page height and minimize white space
  const getScaleFactor = () => {
    if (rowCount <= 18) return 1.0; // Full size for 18 or fewer rows
    if (rowCount >= 40) return 0.45; // Minimum scale for 40+ rows
    // More aggressive linear scaling between 18 and 40 rows
    // For 32 rows: scale = 1.0 - ((32-18)/(40-18)) * 0.55 = 1.0 - 0.35 = 0.65
    // But we'll make it even more aggressive
    return 1.0 - ((rowCount - 18) / (40 - 18)) * 0.55;
  };

  const scaleFactor = getScaleFactor();

  // Calculate scaled values with more aggressive minimums
  const getScaledValue = (baseValue, minValue = baseValue * 0.4) => {
    return Math.max(baseValue * scaleFactor, minValue);
  };

  // More aggressive padding reduction for larger datasets
  const getPadding = () => {
    if (rowCount <= 18) return '10mm 8mm';
    if (rowCount <= 25) return '6mm 5mm';
    if (rowCount <= 32) return '4mm 4mm';
    return '3mm 3mm';
  };

  // Scaled dimensions - more aggressive reduction
  const containerPadding = getPadding();
  const dateFontSize = `${getScaledValue(1.0, 0.65)}rem`;
  const headerFontSize = `${getScaledValue(1.4, 0.9)}rem`;
  const headerMarginBottom = getScaledValue(1.5, 0.5);
  const headerPaddingBottom = getScaledValue(0.8, 0.3);
  const tableHeaderFontSize = `${getScaledValue(0.9, 0.6)}rem`;
  // Even more aggressive cell padding reduction for 32+ rows
  const getTableHeaderPaddingY = () => {
    if (rowCount <= 18) return 0.8;
    if (rowCount <= 25) return 0.5;
    if (rowCount <= 32) return 0.3;
    return 0.2;
  };
  
  const getTableDataPaddingY = () => {
    if (rowCount <= 18) return 0.6;
    if (rowCount <= 25) return 0.35;
    if (rowCount <= 32) return 0.2;
    return 0.15;
  };

  const tableHeaderPaddingY = getTableHeaderPaddingY();
  const tableHeaderPaddingX = getScaledValue(0.6, 0.25);
  const tableDataFontSize = `${getScaledValue(0.85, 0.55)}rem`;
  const tableDataPaddingY = getTableDataPaddingY();
  const tableDataPaddingX = getScaledValue(0.6, 0.25);
  const dateMarginBottom = getScaledValue(1.0, 0.3);

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '210mm', // A4 width
      height: 'auto', // Let content determine height
      p: containerPadding, // Dynamic padding based on row count
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: dateMarginBottom }}>
        <Typography sx={{ fontSize: dateFontSize, color: '#666', fontWeight: 500 }}>
          {currentDate}
        </Typography>
      </Box>

      {/* Header - PO NO. and DEST */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: headerMarginBottom,
        pb: headerPaddingBottom,
        borderBottom: '2px solid #000'
      }}>
        <Typography sx={{ 
          fontSize: headerFontSize, 
          fontWeight: 700, 
          color: '#000',
          textTransform: 'uppercase'
        }}>
          PO NO.: {orderNo}
        </Typography>
        <Typography sx={{ 
          fontSize: headerFontSize, 
          fontWeight: 700, 
          color: '#d32f2f',
          textTransform: 'uppercase'
        }}>
          DEST: {destination}
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
                px: tableHeaderPaddingX
              }}>
                S.No.
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Length
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Width
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Thickness
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Quality
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                No. of Pcs
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Species
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Type of Glue
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Class
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Lot Number
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                Total Pallets
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableHeaderPaddingX }}>
                CBM
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mainRows.map((row, index) => (
              <TableRow key={index} sx={{ backgroundColor: '#fff' }}>
                <TableCell sx={{ 
                  border: '1px solid #000', 
                  textAlign: 'center',
                  py: tableDataPaddingY,
                  fontSize: tableDataFontSize,
                  px: tableDataPaddingX
                }}>
                  {row.LOTNUMBER || index + 1}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.LENGTH ? parseFloat(row.LENGTH).toFixed(3) : ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.WIDTH ? parseFloat(row.WIDTH).toFixed(3) : ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.THICKNESS ? parseFloat(row.THICKNESS).toFixed(2) : ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.QUALITY || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.PCS || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.SPECIES || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.GLUE || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.CLASS || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.LOTNUMBER || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.TOTAL_PALLETS || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableDataPaddingX }}>
                  {row.CBM ? parseFloat(row.CBM).toFixed(3) : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MainListTable;

