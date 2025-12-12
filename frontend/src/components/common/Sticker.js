import React from 'react';
import { Box, Typography} from '@mui/material';

const Sticker = ({
  company, consignee, destination,
  length, width, thickness,
  quality, pcs, species,
  glue, productClass, lotNumber, totalPallets, orderNo,
  certificates = []
}) => {
  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '210mm', // A4 width
      p: '12mm',
      mx: 'auto',
      background: '#fff',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Date Header */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>
          {currentDate}
        </Typography>
      </Box>

      {/* Top Header - Company Info */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: 2, 
        mb: 3,
        pb: 2,
        borderBottom: '3px solid #2e3192'
      }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#2e3192', fontSize: '1.1rem', mb: 0.5, letterSpacing: '0.5px' }}>
            SHIPPER :
          </Typography>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, textTransform: 'uppercase' }}>
            {company || 'N/A'}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#2e3192', fontSize: '1.1rem', mb: 0.5, letterSpacing: '0.5px' }}>
            CONSIGNEE :
          </Typography>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, textTransform: 'uppercase' }}>
            {consignee || 'N/A'}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#2e3192', fontSize: '1.1rem', mb: 0.5, letterSpacing: '0.5px' }}>
            DESTINATION :
          </Typography>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, textTransform: 'uppercase' }}>
            {destination || 'N/A'}
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* Size - Emphasized */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#f5f5f5', 
          borderLeft: '5px solid #2e3192',
          borderRadius: '4px'
        }}>
          <Typography sx={{ 
            color: '#2e3192', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            mb: 1,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            SIZE (MM) (LONGUEUR X LARGEUR X ÉPAISSEUR):
          </Typography>
          <Typography sx={{ 
            fontSize: '2.2rem', 
            fontWeight: 700,
            color: '#000',
            letterSpacing: '1px'
          }}>
            {length} X {width} X {thickness}
          </Typography>
        </Box>

        {/* Quality and Pieces */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box sx={{ p: 1.5, border: '2px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography sx={{ color: '#2e3192', fontWeight: 700, fontSize: '1.1rem', mb: 0.5, textTransform: 'uppercase' }}>
              QUALITY :
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {quality || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, border: '2px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography sx={{ color: '#2e3192', fontWeight: 700, fontSize: '1.1rem', mb: 0.5, textTransform: 'uppercase' }}>
              NOMBRE DE PIÈCES / CUBAGE (M³) :
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {pcs || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Species, Glue/Class */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box sx={{ p: 1.5, border: '2px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography sx={{ color: '#2e3192', fontWeight: 700, fontSize: '1.1rem', mb: 0.5, textTransform: 'uppercase' }}>
              ESSENCE :
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {species || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, border: '2px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography sx={{ color: '#2e3192', fontWeight: 700, fontSize: '1.1rem', mb: 0.5, textTransform: 'uppercase' }}>
              TYPE DE COLLE / CLASSE :
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {glue} / {productClass}
            </Typography>
          </Box>
        </Box>

        {/* Palette Number and PO */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box sx={{ p: 1.5, border: '2px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography sx={{ color: '#2e3192', fontWeight: 700, fontSize: '1.1rem', mb: 0.5, textTransform: 'uppercase' }}>
              NUMÉRO DE PALETTE :
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {lotNumber} / {totalPallets}
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, border: '2px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography sx={{ color: '#2e3192', fontWeight: 700, fontSize: '1.1rem', mb: 0.5, textTransform: 'uppercase' }}>
              PO. NO. :
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {orderNo || 'N/A'}
            </Typography>
          </Box>
        </Box>

      </Box>

      {/* Certificates Footer */}
      {certificates.filter(Boolean).length > 0 && (
        <Box sx={{ 
          mt: 2.5, 
          pt: 2, 
          borderTop: '3px solid #2e3192',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          alignItems: 'center'
        }}>
          {certificates.filter(Boolean).map((val, idx) => (
            <Typography 
              key={idx} 
              sx={{ 
                color: '#2e3192', 
                fontWeight: 600, 
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                textAlign: 'center'
              }}
            >
              {val}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Sticker;
