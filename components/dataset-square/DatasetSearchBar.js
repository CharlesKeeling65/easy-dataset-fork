'use client';

import SearchIcon from '@mui/icons-material/Search';
import {
  alpha,
  Box,
  InputAdornment,
  TextField,
  useTheme
} from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function DatasetSearchBar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const theme = useTheme();
  const { t } = useTranslation();

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      event.preventDefault();
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }} ref={searchRef}>
      <TextField
        fullWidth
        placeholder={t('datasetSquare.searchPlaceholder')}
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleSearchSubmit}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
          sx: {
            height: 56,
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.default, 0.6)
              : alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(8px)',
            px: 2,
            transition: 'all 0.3s ease',
            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`,
            '&.MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : alpha(theme.palette.common.white, 0.95),
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }
        }}
        sx={{
          mb: 1,
          '& .MuiInputBase-input': {
            fontSize: '1rem',
            fontWeight: 500,
            color: theme.palette.text.primary,
          },
          '& .MuiInputBase-input::placeholder': {
            color: alpha(theme.palette.text.primary, 0.6),
            opacity: 0.7,
          }
        }}
      />
    </Box>
  );
}
