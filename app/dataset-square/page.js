'use client';

import Navbar from '@/components/Navbar';
import { DatasetSearchBar } from '@/components/dataset-square/DatasetSearchBar';
import { DatasetSiteList } from '@/components/dataset-square/DatasetSiteList';
import StorageIcon from '@mui/icons-material/Storage';
import { alpha, Box, CircularProgress, Container, Paper, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DatasetSquarePage() {
  const [projects, setProjects] = useState([]);
  const [models, setModels] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      try {
        const userProjectIds = JSON.parse(localStorage.getItem('userProjects') || '[]');

        if (userProjectIds.length === 0) {
          setProjects([]);
          return;
        }

        const projectsResponse = await fetch(`/api/projects?projectIds=${userProjectIds.join(',')}`);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        } else {
          console.error('Failed to fetch projects');
        }

        const modelsResponse = await fetch('/api/models');
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          setModels(modelsData);
        } else {
          console.error('Failed to fetch models');
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    }

    fetchData();
  }, []);

  const handleSearch = async (query) => {
    if (!query || query.trim() === '') return;

    console.log('Searching for:', query);
    setIsSearching(true);
    setSearchResults(null);
    setSearchError(null);

    try {
      const response = await fetch('/api/dataset-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        let errorMsg = t('datasetSquare.searchError');
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }

      const data = await response.json();
      setSearchResults(data);

    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error.message || t('datasetSquare.searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main>
      <Navbar projects={projects} models={models} hideModels={true} />

      <Box
        sx={{
          pt: 10,
          pb: 8,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.6)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.light, 0.7)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 70%)`,
            filter: 'blur(30px)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.15)} 0%, transparent 70%)`,
            filter: 'blur(20px)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <StorageIcon
              sx={{
                fontSize: 48,
                mr: 2.5,
                color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : 'white',
                filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))'
              }}
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                color: 'white',
                textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                mb: 0,
                letterSpacing: '-0.5px',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%)'
                  : 'linear-gradient(90deg, #ffffff 30%, #f5f5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textFillColor: 'transparent'
              }}
            >
              {t('datasetSquare.title')}
            </Typography>
          </Box>
          <Typography
            variant="h5"
            align="center"
            sx={{
              maxWidth: 800,
              mx: 'auto',
              mb: 6,
              color: theme.palette.mode === 'dark' ? alpha('#FFFFFF', 0.9) : '#FFFFFF',
              fontWeight: 400,
              lineHeight: 1.6,
              textShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {t('datasetSquare.subtitle')}
          </Typography>

          <Box sx={{
            maxWidth: 800,
            mx: 'auto',
            position: 'relative',
            zIndex: 10
          }}>
            <Paper
              elevation={6}
              sx={{
                width: '100%',
                p: 2.5,
                borderRadius: 3,
                background: 'transparent',
                backdropFilter: 'blur(10px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 10px 40px rgba(0,0,0,0.3)'
                  : '0 10px 40px rgba(0,0,0,0.15)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transform: 'translateY(0)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 15px 50px rgba(0,0,0,0.4)'
                    : '0 15px 50px rgba(0,0,0,0.2)'
                },
                overflow: 'visible'
              }}
            >
              <DatasetSearchBar onSearch={handleSearch} />
            </Paper>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {isSearching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>{t('datasetSquare.searching')}</Typography>
          </Box>
        )}
        {searchError && (
          <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>{t('common.error')}</Typography>
            <Typography>{searchError}</Typography>
          </Paper>
        )}
        {searchResults && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.7) : alpha(theme.palette.background.default, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
              mb: 4
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>{t('datasetSquare.searchResultsTitle')}</Typography>
            <pre>{JSON.stringify(searchResults, null, 2)}</pre>
          </Paper>
        )}

        {!isSearching && !searchResults && !searchError && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              bgcolor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : theme.palette.background.paper,
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0,0,0,0.2)'
                : '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <DatasetSiteList />
          </Paper>
        )}
      </Container>
    </main>
  );
}
