import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const PackingListTable = ({ data }) => {
  const {
    companyInfo,
    workOrderInfo,
    mainRows,
    containerInfo
  } = data;

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const containerNo = containerInfo?.ContainerNo || '';
  const sealNo = containerInfo?.SEAL_NO || '';
  const loadingDate = containerInfo?.LOADINGDATE ? new Date(containerInfo.LOADINGDATE).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : currentDate;
  const portOfLoading = containerInfo?.PortofLoading || 'LIBREVILLE, GABON';
  const species = containerInfo?.SPICES || workOrderInfo?.SPECIES || '';
  const orderNo = containerInfo?.ORDERNO || workOrderInfo?.Work_OrderNo || '';
  const incoterm = workOrderInfo?.SHIPPING_TERM || 'FOB';
  const shippingLine = containerInfo?.Shipping_Line || workOrderInfo?.SHIPPING_LINE || '';
  const portOfDischarge = containerInfo?.DESTINATION || workOrderInfo?.DESTINATION_PORTNAME || '';
  
  // Exporter info
  const exporterName = companyInfo?.Company_Name || 'STAR PLY GABON';
  const exporterAddress = companyInfo?.ADDRESS || 'BP 1024, PLOT NO B2/B1, GSEZ, NKOK, LIBREVILLE, GABON';
  const exporterEmail = companyInfo?.WEBSITE || 'starplygabon@gmail.com';
  const exporterTel = companyInfo?.CONTACT_NO || '+241 66884164, 62357222';
  
  // Consignee info
  const consigneeName = containerInfo?.CONSIGNEE || workOrderInfo?.Client_Name || '';
  const consigneeAddress = workOrderInfo?.SHIPTO_PARTYNAME || '';
  const consigneeCountry = workOrderInfo?.DESTINATION_COUNTRY || '';
  const notifyParty = workOrderInfo?.CONSIGNEE_NAME || '';

  // Calculate cumulative CBM
  let cumulativeCBM = 0;
  const packingRows = mainRows.map((row, index) => {
    const cbm = parseFloat(row.CBM) || 0;
    cumulativeCBM += cbm;
    return {
      ...row,
      individualCBM: cbm,
      cumulativeCBM: cumulativeCBM
    };
  });

  const totalCBM = cumulativeCBM;
  const totalPallets = packingRows.length;
  const totalWeight = workOrderInfo?.Poids_Net || '22500';

  // Dynamic scaling based on row count - prioritize readability
  const rowCount = packingRows.length;
  
  const getOptimalScale = () => {
    if (rowCount <= 12) return 1.0;
    if (rowCount <= 16) return 0.95;  // Less aggressive scaling
    if (rowCount <= 20) return 0.9;
    if (rowCount <= 25) return 0.85;
    if (rowCount <= 32) return 0.8;   // Less aggressive for 32 rows
    return 0.75;
  };

  const scaleFactor = getOptimalScale();
  const getScaledValue = (baseValue, minValue) => {
    return Math.max(baseValue * scaleFactor, minValue);
  };

  // Padding and margins to match exact format - tighter spacing
  const getPadding = () => {
    if (rowCount <= 12) return '8mm 6mm';
    if (rowCount <= 16) return '5mm 4mm';
    if (rowCount <= 20) return '4mm 3mm';
    if (rowCount <= 25) return '3mm 2mm';
    return '2mm 2mm';
  };

  const containerPadding = getPadding();
  
  // Font sizes - balanced for readability
  const titleFontSize = `${getScaledValue(1.8, 1.5)}rem`;
  const headerFontSize = `${getScaledValue(1.0, 0.9)}rem`;  // A bit smaller
  const tableHeaderFontSize = `${getScaledValue(0.95, 0.85)}rem`;  // A bit smaller
  const tableDataFontSize = `${getScaledValue(0.9, 0.8)}rem`;    // A bit smaller but still readable
  
  // Cell padding
  const getTableHeaderPaddingY = () => {
    if (rowCount <= 12) return 0.8;
    if (rowCount <= 16) return 0.5;
    if (rowCount <= 20) return 0.45;
    if (rowCount <= 25) return 0.4;
    return 0.35;
  };
  
  const getTableDataPaddingY = () => {
    if (rowCount <= 12) return 0.6;
    if (rowCount <= 16) return 0.4;
    if (rowCount <= 20) return 0.35;
    if (rowCount <= 25) return 0.3;
    return 0.25;
  };

  const tableHeaderPaddingY = getTableHeaderPaddingY();
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
      position: 'relative',
      '@media print': {
        minHeight: 'auto !important',
        height: 'auto !important',
        maxHeight: '297mm !important',
        pageBreakAfter: 'auto !important',
        pageBreakInside: 'avoid !important',
        overflow: 'visible'
      }
    }}>
      {/* Top-right logo (from public/starply-logo.png) */}
      <Box
        component="img"
        src="/starply-logo.png"
        alt="Starply Logo"
        sx={{
          position: 'absolute',
          top: '8mm',
          right: '8mm',
          width: '30mm',
          height: 'auto',
          display: 'block'
        }}
      />
      {/* Title - Centered */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography sx={{ 
          fontSize: titleFontSize, 
          fontWeight: 700, 
          color: '#000',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          lineHeight: 1.1
        }}>
          SPECIFICATION
        </Typography>
      </Box>

      {/* Exporter Section - Exact format matching image */}
      <Box sx={{ mb: 0.8 }}>
        <Typography sx={{ fontSize: headerFontSize, fontWeight: 700, mb: 0.3, lineHeight: 1.2 }}>
          Exporter:
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
          {exporterName}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
          {exporterAddress}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          Email: {exporterEmail}
        </Typography>
      </Box>

      {/* Consignee Section - Exact format matching image */}
      <Box sx={{ mb: 0.8 }}>
        <Typography sx={{ fontSize: headerFontSize, fontWeight: 700, mb: 0.3, lineHeight: 1.2 }}>
          Consignee (Destinataire):
        </Typography>
        {consigneeName && (
          <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
            {consigneeName}
          </Typography>
        )}
        {notifyParty && (
          <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
            P/C: {notifyParty}
          </Typography>
        )}
        {consigneeAddress && (
          <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
            {consigneeAddress}
          </Typography>
        )}
        {consigneeCountry && (
          <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
            {consigneeCountry}
          </Typography>
        )}
      </Box>

      {/* Shipment Details - 2 column grid matching exact format */}
      <Box sx={{ mb: 0.8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', rowGap: '0.25rem' }}>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Date:</strong> {loadingDate}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Incoterm:</strong> {incoterm}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Port of Loading:</strong> {portOfLoading}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Shipped Through:</strong> {shippingLine}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Species:</strong> {species}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Port of Discharge:</strong> {portOfDischarge}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Purchase Order No.:</strong> PO {orderNo}
        </Typography>
      </Box>

      {/* Container and Seal Info - Displayed above table */}
      <Box sx={{ mb: 0.6, display: 'flex', gap: 2 }}>
        {containerNo && (
          <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
            <strong>Conteneur:</strong> {containerNo}
          </Typography>
        )}
        {sealNo && (
          <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
            <strong>Plomb:</strong> {sealNo}
          </Typography>
        )}
      </Box>

      {/* Table - PALLET NO. first, then Description, Quantité, Metre Cube */}
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #000', width: '100%', mb: 0.8 }}>
        <Table sx={{ borderCollapse: 'collapse', width: '100%' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#ffb74d' }}>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'left', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: 0.5, lineHeight: 1.1 }}>
                PALLET NO.
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'left', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: 0.5, lineHeight: 1.1 }}>
                Description des biens
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'left', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: 0.5, lineHeight: 1.1 }}>
                Quantité
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'left', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: 0.5, lineHeight: 1.1 }}>
                Metre Cube
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packingRows.map((row, index) => (
              <TableRow key={index} sx={{ backgroundColor: '#fff' }}>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: 0.5, lineHeight: 1.1 }}>
                  {row.LOTNUMBER || index + 1}/{row.TOTAL_PALLETS || totalPallets}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'left', py: tableDataPaddingY, fontSize: tableDataFontSize, px: 0.5, lineHeight: 1.1 }}>
                  Contre-plaqué {row.LENGTH} X {row.WIDTH} X {row.THICKNESS} MM
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'left', py: tableDataPaddingY, fontSize: tableDataFontSize, px: 0.5, lineHeight: 1.1 }}>
                  {row.PCS} PCS. (1 PACKAGE OF {row.PCS} PCS.)
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right', py: tableDataPaddingY, fontSize: tableDataFontSize, px: 0.5, lineHeight: 1.1 }}>
                  {row.individualCBM.toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Section - Exact format matching image */}
      <Box sx={{ mt: 0.8 }}>
        <Typography sx={{ fontSize: headerFontSize, mb: 0.3, lineHeight: 1.2 }}>
          <strong>Note:</strong> Pour Industrie DuBois
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
          <strong>TOTAL {totalPallets} PACKAGE</strong>
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
          <strong>Total Metre Cube:</strong> {totalCBM.toFixed(3)}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          <strong>Poids Net (Net Weight):</strong> {totalWeight} KGS
        </Typography>
      </Box>

      {/* Company Contact Box - Exact format matching image */}
      <Box sx={{ 
        mt: 0.8, 
        p: 0.8, 
        border: '2px solid #000', 
        borderRadius: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1
      }}>
        <Box>
          <Typography sx={{ fontSize: headerFontSize, fontWeight: 700, mb: 0.25, lineHeight: 1.2 }}>
            {exporterName}
          </Typography>
          <Typography sx={{ fontSize: headerFontSize, mb: 0.25, lineHeight: 1.2 }}>
            {exporterAddress.split(',')[0]}
          </Typography>
          <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
            Tel: {exporterTel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PackingListTable;
