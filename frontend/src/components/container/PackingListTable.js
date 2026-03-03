import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const PackingListTable = ({ data, columnVisibility = { glue: true, quality: true, type: false, species: false } }) => {
  const {
    companyInfo,
    workOrderInfo,
    mainRows,
    containerInfo,
    summaryRows,
    originData,
    weightData // Add weightData to destructuring
  } = data;

  const containerNo = containerInfo?.ContainerNo || '';
  const sealNo = containerInfo?.SEAL_NO || '';
  const loadingDate = containerInfo?.LOADINGDATE ? new Date(containerInfo.LOADINGDATE).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const portOfLoading = containerInfo?.PortofLoading || 'LIBREVILLE, GABON';
  const species = containerInfo?.SPICES || workOrderInfo?.SPECIES || '';
  const orderNo = containerInfo?.ORDERNO || workOrderInfo?.Work_OrderNo || '';
  const incoterm = workOrderInfo?.SHIPPING_TERM || 'FOB';
  const shippingLine = containerInfo?.Shipping_Line || workOrderInfo?.SHIPPING_LINE || '';
  const portOfDischarge = containerInfo?.DESTINATION || workOrderInfo?.DESTINATION_PORTNAME || '';
  
  // Exporter info
  const exporterName = companyInfo?.Company_Name || 'STAR PLY GABON';
  const exporterAddress = companyInfo?.ADDRESS || 'BP 1024, PLOT NO B2/B1, GSEZ, NKOK, LIBREVILLE, GABON';
  const exporterEmail = companyInfo?.EMAIL || 'starplygabon@gmail.com';
  // const exporterTel = companyInfo?.CONTACT_NO || '+241 66884164, 62357222'; // Unused variable removed

  
  
  // Consignee info
  const consigneeName = workOrderInfo?.SHIPTO_PARTYNAME || containerInfo?.CONSIGNEE || '';
  const consigneeAddress = workOrderInfo?.SHIPTOADDRESS || workOrderInfo?.shiptoaddress || workOrderInfo?.ShipToAddress || '';
  const consigneeCountry = workOrderInfo?.DESTINATION_COUNTRY || '';
  // const notifyParty = workOrderInfo?.CONSIGNEE_NAME || ''; // Unused variable removed
  
  // FSC Certification - Only show if CERTIFICATION_LEGAL exactly equals "FSC"
  const certificationLegal = workOrderInfo?.CERTIFICATION_LEGAL || '';
  const isFSC = certificationLegal.toUpperCase() === 'FSC';

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
  const totalWeight = weightData?.WEIGHT || workOrderInfo?.Poids_Net || '22500'; // Use WEIGHT from record set 8
  const totalQuantity = packingRows.reduce((sum, row) => sum + (parseInt(row.PCS) || 0), 0);

  // Dynamic scaling based on row count AND column count - balanced approach to utilize page space
  const rowCount = packingRows.length;
  
  // Count visible columns (base columns + optional columns)
  const baseColumnCount = 4; // PALLET NO., Description, Quantité, Metre Cube
  const optionalColumnCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalColumnCount = baseColumnCount + optionalColumnCount;
  
  const getOptimalScale = () => {
    // Base scale factor based on row count
    let baseScale;
    if (rowCount <= 15) baseScale = 1.0;
    else if (rowCount <= 20) baseScale = 0.94;
    else if (rowCount <= 25) baseScale = 0.88;
    else if (rowCount <= 30) baseScale = 0.82;
    else if (rowCount <= 35) baseScale = 0.78;
    else if (rowCount <= 40) baseScale = 0.74;
    else if (rowCount <= 45) baseScale = 0.70;
    else baseScale = 0.68;
    
    // Column scaling - more aggressive for single columns to prevent overflow
    let columnScale = 1.0;
    if (totalColumnCount <= 4) columnScale = 1.0;
    else if (totalColumnCount === 5) {
      // Single optional column - be more aggressive to prevent overflow
      columnScale = 0.92;
    }
    else if (totalColumnCount === 6) columnScale = 0.88;
    else if (totalColumnCount === 7) columnScale = 0.84;
    else columnScale = 0.80;
    
    // FSC scaling - more aggressive when needed
    let fscScale = 1.0;
    if (isFSC) {
      if (rowCount >= 30 && totalColumnCount >= 6) fscScale = 0.95;
      else if (rowCount >= 25 && totalColumnCount >= 5) fscScale = 0.97;
      else if (rowCount >= 20 || totalColumnCount >= 6) fscScale = 0.98;
    }
    
    return baseScale * columnScale * fscScale;
  };

  const scaleFactor = getOptimalScale();
  const getScaledValue = (baseValue, minValue) => {
    return Math.max(baseValue * scaleFactor, minValue);
  };

  const getPadding = () => {
    // More aggressive padding reduction for better space utilization
    const basePadding = (() => {
      if (rowCount <= 15) return { top: 8, side: 6 };
      if (rowCount <= 20) return { top: 7, side: 5 };
      if (rowCount <= 25) return { top: 6, side: 4 };
      if (rowCount <= 30) return { top: 5.5, side: 3.5 };
      if (rowCount <= 35) return { top: 5, side: 3 };
      if (rowCount <= 40) return { top: 4.5, side: 2.5 };
      return { top: 4, side: 2 };
    })();
    
    // More aggressive column-based adjustments for single columns
    let columnAdjustment;
    if (totalColumnCount <= 4) columnAdjustment = 1.0;
    else if (totalColumnCount === 5) columnAdjustment = 0.90; // More aggressive for single column
    else if (totalColumnCount === 6) columnAdjustment = 0.85;
    else if (totalColumnCount === 7) columnAdjustment = 0.80;
    else columnAdjustment = 0.75;
    
    return `${basePadding.top * columnAdjustment}mm ${basePadding.side * columnAdjustment}mm`;
  };

  const containerPadding = getPadding();
  
  const getSectionMargin = () => {
    // More aggressive margin reduction for better space utilization
    let baseMargin;
    if (rowCount <= 15) baseMargin = 0.8;
    else if (rowCount <= 20) baseMargin = 0.70;
    else if (rowCount <= 25) baseMargin = 0.60;
    else if (rowCount <= 30) baseMargin = 0.55;
    else if (rowCount <= 35) baseMargin = 0.50;
    else if (rowCount <= 40) baseMargin = 0.45;
    else baseMargin = 0.40;
    
    // More aggressive column-based adjustments for single columns
    let columnAdjustment;
    if (totalColumnCount <= 4) columnAdjustment = 1.0;
    else if (totalColumnCount === 5) columnAdjustment = 0.90; // More aggressive for single column
    else if (totalColumnCount === 6) columnAdjustment = 0.85;
    else if (totalColumnCount === 7) columnAdjustment = 0.80;
    else columnAdjustment = 0.75;
    
    return baseMargin * columnAdjustment;
  };

  const sectionMargin = getSectionMargin();
  
  // Font sizes - balanced middle ground
  const titleFontSize = `${getScaledValue(1.7, 1.15)}rem`;
  const headerFontSize = `${getScaledValue(0.95, 0.77)}rem`;
  const tableHeaderFontSize = `${getScaledValue(0.87, 0.72)}rem`;
  const tableDataFontSize = `${getScaledValue(0.82, 0.67)}rem`;
  
  const getTableHeaderPaddingY = () => {
    // More aggressive padding reduction for better space utilization
    let basePadding;
    if (rowCount <= 15) basePadding = 0.6;
    else if (rowCount <= 20) basePadding = 0.50;
    else if (rowCount <= 25) basePadding = 0.40;
    else if (rowCount <= 30) basePadding = 0.35;
    else if (rowCount <= 35) basePadding = 0.30;
    else if (rowCount <= 40) basePadding = 0.25;
    else basePadding = 0.20;
    
    // More aggressive column-based adjustments for single columns
    let columnAdjustment;
    if (totalColumnCount <= 4) columnAdjustment = 1.0;
    else if (totalColumnCount === 5) columnAdjustment = 0.90; // More aggressive for single column
    else if (totalColumnCount === 6) columnAdjustment = 0.85;
    else if (totalColumnCount === 7) columnAdjustment = 0.80;
    else columnAdjustment = 0.75;
    
    return basePadding * columnAdjustment;
  };
  
  const getTableDataPaddingY = () => {
    // More aggressive padding reduction for better space utilization
    let basePadding;
    if (rowCount <= 15) basePadding = 0.5;
    else if (rowCount <= 20) basePadding = 0.40;
    else if (rowCount <= 25) basePadding = 0.30;
    else if (rowCount <= 30) basePadding = 0.25;
    else if (rowCount <= 35) basePadding = 0.20;
    else if (rowCount <= 40) basePadding = 0.15;
    else basePadding = 0.10;
    
    // More aggressive column-based adjustments for single columns
    let columnAdjustment;
    if (totalColumnCount <= 4) columnAdjustment = 1.0;
    else if (totalColumnCount === 5) columnAdjustment = 0.90; // More aggressive for single column
    else if (totalColumnCount === 6) columnAdjustment = 0.85;
    else if (totalColumnCount === 7) columnAdjustment = 0.80;
    else columnAdjustment = 0.75;
    
    return basePadding * columnAdjustment;
  };

  const getTableCellPaddingX = () => {
    // More aggressive horizontal padding adjustments for single columns
    if (totalColumnCount <= 4) return 0.5;
    if (totalColumnCount === 5) return 0.35; // More aggressive for single column
    if (totalColumnCount === 6) return 0.30;
    if (totalColumnCount === 7) return 0.25;
    return 0.20;
  };

  const tableHeaderPaddingY = getTableHeaderPaddingY();
  const tableDataPaddingY = getTableDataPaddingY();
  const tableCellPaddingX = getTableCellPaddingX();

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
      <Box sx={{ textAlign: 'center', mb: sectionMargin * 0.5 }}>
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

      {/* Consignee Section - Now shown first */}
      <Box sx={{ mb: sectionMargin }}>
        <Typography sx={{ fontSize: headerFontSize, fontWeight: 700, mb: sectionMargin * 0.3, lineHeight: 1.2 }}>
          Consignee (Destinataire):
        </Typography>
        {consigneeName && (
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
            {consigneeName}
          </Typography>
        )}
        {workOrderInfo?.Client_Name && (
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
            P/C : {workOrderInfo.Client_Name}
          </Typography>
        )}
        {consigneeAddress && (
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
            {consigneeAddress}
          </Typography>
        )}
        {consigneeCountry && (
          <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
            {consigneeCountry}
          </Typography>
        )}
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          Source d'approvisionnement: CFAD {originData?.ORIGIN || 'HAUT-ABANGA'} - UFA-UFG1 {originData?.AAC || 'ACC1422'}
        </Typography>
        {isFSC && (
          <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2, mt: sectionMargin * 0.25 }}>
            <strong>LEVEL CERTIFICATION: FSC 100%</strong>
          </Typography>
        )}
      </Box>

      {/* Exporter Section - Now shown second */}
      <Box sx={{ mb: sectionMargin }}>
        <Typography sx={{ fontSize: headerFontSize, fontWeight: 700, mb: sectionMargin * 0.3, lineHeight: 1.2 }}>
          Exporter:
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
          {exporterName}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
          {exporterAddress}
        </Typography>
        <Typography sx={{ fontSize: headerFontSize, lineHeight: 1.2 }}>
          Email: {exporterEmail} | Tel: +241 62 35 72 22
        </Typography>
      </Box>

      {/* Shipment Details - 2 column grid matching exact format */}
      <Box sx={{ mb: sectionMargin, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', rowGap: `${sectionMargin * 0.25}rem` }}>
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
          <strong>Purchase Order No.:</strong> {orderNo}
        </Typography>
      </Box>

      {/* Container and Seal Info - Displayed above table */}
      <Box sx={{ mb: sectionMargin * 0.75, display: 'flex', gap: 2 }}>
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
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #000', width: '100%', mb: sectionMargin }}>
        <Table sx={{ borderCollapse: 'collapse', width: '100%' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#ffb74d' }}>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                PALLET NO.
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                Description des biens
              </TableCell>
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                Quantité
              </TableCell>
              {columnVisibility.glue && (
                <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  Glue
                </TableCell>
              )}
              {columnVisibility.quality && (
                <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  QUALITY
                </TableCell>
              )}
              {columnVisibility.type && (
                <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  TYPE
                </TableCell>
              )}
              {columnVisibility.species && (
                <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  SPECIES
                </TableCell>
              )}
              <TableCell sx={{ border: '1px solid #000', fontWeight: 700, textAlign: 'center', py: tableHeaderPaddingY, fontSize: tableHeaderFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                Metre Cube
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packingRows.map((row, index) => (
              <TableRow key={index} sx={{ backgroundColor: '#fff' }}>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  {row.LOTNUMBER || index + 1}/{row.TOTAL_PALLETS || totalPallets}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  Contre-plaqué {row.LENGTH} X {row.WIDTH} X {row.THICKNESS} MM
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  {row.PCS} PCS. (1 PACKAGE OF {row.PCS} PCS.)
                </TableCell>
                {columnVisibility.glue && (
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                    {row.GLUE || ''}
                  </TableCell>
                )}
                {columnVisibility.quality && (
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                    {row.QUALITY || ''}
                  </TableCell>
                )}
                {columnVisibility.type && (
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                    {row.TYPE || ''}
                  </TableCell>
                )}
                {columnVisibility.species && (
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                    {row.SPECIES || ''}
                  </TableCell>
                )}
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', py: tableDataPaddingY, fontSize: tableDataFontSize, px: tableCellPaddingX, lineHeight: 1.1 }}>
                  {parseFloat(row.individualCBM).toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Section - 40-60 Layout */}
      <Box sx={{ mt: sectionMargin, display: 'flex', gap: 0, width: '100%' }}>
        {/* Left Side - 40% - Summary Text */}
        <Box sx={{ 
          flex: '0 0 40%',
          pr: 1
        }}>
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.3, lineHeight: 1.2 }}>
            <strong>Note:</strong> Pour Industrie DuBois
          </Typography>
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
            <strong>TOTAL {totalPallets} PACKAGE</strong>
          </Typography>
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
            <strong>Total Quantité:</strong> {totalQuantity} PCS
          </Typography>
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.25, lineHeight: 1.2 }}>
            <strong>Total Metre Cube:</strong> {parseFloat(totalCBM).toFixed(3)}
          </Typography>
          <Typography sx={{ fontSize: headerFontSize, mb: sectionMargin * 0.5, lineHeight: 1.2 }}>
            <strong>Poids Net (Net Weight):</strong> {totalWeight} KGS
          </Typography>

          {/* FSC Certification Block - Only show if FSC 100% */}
          {isFSC && (
            <Box sx={{
              mt: sectionMargin * (totalColumnCount > 6 ? 0.2 : 0.3),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              {/* FSC Certificate Image */}
              <Box
                component="img"
                src="/fsc-certificate.jpeg"
                alt="FSC Certificate"
                sx={{
                  width: `${getScaledValue(
                    totalColumnCount > 6 && rowCount >= 20 ? 70 : 
                    totalColumnCount > 6 ? 80 : 
                    rowCount >= 25 ? 85 : 100, 
                    50
                  )}px`,
                  height: 'auto',
                  mb: sectionMargin * (totalColumnCount > 6 ? 0.1 : 0.15)
                }}
              />
              
              {/* Certificate Number */}
              <Typography sx={{ 
                fontSize: `${getScaledValue(
                  totalColumnCount > 6 && rowCount >= 20 ? 0.55 : 
                  totalColumnCount > 6 ? 0.6 : 
                  rowCount >= 25 ? 0.6 : 0.65, 
                  0.4
                )}rem`,
                fontWeight: 600,
                mb: sectionMargin * (totalColumnCount > 6 ? 0.05 : 0.1),
                lineHeight: 1.1
              }}>
                CU-COC-874178
              </Typography>
              
              {/* FSC Disclaimer */}
              <Typography sx={{ 
                fontSize: `${getScaledValue(
                  totalColumnCount > 6 && rowCount >= 20 ? 0.45 : 
                  totalColumnCount > 6 ? 0.5 : 
                  rowCount >= 25 ? 0.5 : 0.55, 
                  0.3
                )}rem`,
                lineHeight: 1.0,
                maxWidth: '100%',
                fontStyle: 'italic'
              }}>
                "Only the products that are identified as such on this document are 100% FSC ®️ certified"
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Side - 60% - Summary Table */}
        <Box sx={{ 
          flex: '0 0 60%',
          width: '60%'
        }}>
          {data.summaryRows && data.summaryRows.length > 0 && (
            <Table sx={{ 
              borderCollapse: 'collapse', 
              width: '100%',
              border: '1px solid #000'
            }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#ffb74d' }}>
                  <TableCell sx={{ 
                    border: '1px solid #000', 
                    fontWeight: 700, 
                    textAlign: 'center',
                    py: 0.35,
                    fontSize: `${getScaledValue(0.8, 0.6)}rem`,
                    px: tableCellPaddingX * 0.7
                  }}>
                    THICKNESS
                  </TableCell>
                  <TableCell sx={{ 
                    border: '1px solid #000', 
                    fontWeight: 700, 
                    textAlign: 'center',
                    py: 0.35,
                    fontSize: `${getScaledValue(0.8, 0.6)}rem`,
                    px: tableCellPaddingX * 0.7
                  }}>
                    LENGTH
                  </TableCell>
                  <TableCell sx={{ 
                    border: '1px solid #000', 
                    fontWeight: 700, 
                    textAlign: 'center',
                    py: 0.35,
                    fontSize: `${getScaledValue(0.8, 0.6)}rem`,
                    px: tableCellPaddingX * 0.7
                  }}>
                    WIDTH
                  </TableCell>
                  <TableCell sx={{ 
                    border: '1px solid #000', 
                    fontWeight: 700, 
                    textAlign: 'center',
                    py: 0.35,
                    fontSize: `${getScaledValue(0.8, 0.6)}rem`,
                    px: tableCellPaddingX * 0.7
                  }}>
                    PCS
                  </TableCell>
                  <TableCell sx={{ 
                    border: '1px solid #000', 
                    fontWeight: 700, 
                    textAlign: 'center',
                    py: 0.35,
                    fontSize: `${getScaledValue(0.8, 0.6)}rem`,
                    px: tableCellPaddingX * 0.7
                  }}>
                    CBM
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summaryRows.map((row, index) => (
                  <TableRow key={index} sx={{ 
                    backgroundColor: row.THICKNESS === 'TOTAL' ? '#fff3e0' : '#fff'
                  }}>
                    <TableCell sx={{ 
                      border: '1px solid #000', 
                      textAlign: 'center',
                      py: 0.25,
                      fontSize: `${getScaledValue(0.75, 0.55)}rem`,
                      px: tableCellPaddingX * 0.7,
                      fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                    }}>
                      {row.THICKNESS || ''}
                    </TableCell>
                    <TableCell sx={{ 
                      border: '1px solid #000', 
                      textAlign: 'center',
                      py: 0.25,
                      fontSize: `${getScaledValue(0.75, 0.55)}rem`,
                      px: tableCellPaddingX * 0.7,
                      fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                    }}>
                      {row.LENGTH === null || row.LENGTH === 'NULL' ? '-' : row.LENGTH}
                    </TableCell>
                    <TableCell sx={{ 
                      border: '1px solid #000', 
                      textAlign: 'center',
                      py: 0.25,
                      fontSize: `${getScaledValue(0.75, 0.55)}rem`,
                      px: tableCellPaddingX * 0.7,
                      fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                    }}>
                      {row.WIDTH === null || row.WIDTH === 'NULL' ? '-' : row.WIDTH}
                    </TableCell>
                    <TableCell sx={{ 
                      border: '1px solid #000', 
                      textAlign: 'center',
                      py: 0.25,
                      fontSize: `${getScaledValue(0.75, 0.55)}rem`,
                      px: tableCellPaddingX * 0.7,
                      fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                    }}>
                      {row.PCS || ''}
                    </TableCell>
                    <TableCell sx={{ 
                      border: '1px solid #000', 
                      textAlign: 'center',
                      py: 0.25,
                      fontSize: `${getScaledValue(0.75, 0.55)}rem`,
                      px: tableCellPaddingX * 0.7,
                      fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                    }}>
                      {row.CBM ? parseFloat(row.CBM).toFixed(3) : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PackingListTable;
