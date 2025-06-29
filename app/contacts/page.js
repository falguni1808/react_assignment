'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchContacts, toggleFavourite } from '@/lib/api';
// import Link from 'next/link';
import {
  Typography,
  List,
  Button,
  TextField,
  Box,
  IconButton,
  Checkbox,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ContactModal from '@/components/ContactModal';
import { useContactStore } from '@/lib/zustandStore';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const queryClient = useQueryClient();

  const router = useRouter();
  const {
    showFavouritesOnly,
    toggleFavouritesOnly,
    selectedContact,
    setSelectedContact,
    clearSelectedContact,
  } = useContactStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contacts', page, search, showFavouritesOnly],
    queryFn: () => fetchContacts(page, search, showFavouritesOnly),
    keepPreviousData: true,
  });

  const handleToggleFavourite = useCallback(async (contact) => {
    await toggleFavourite(contact);
    queryClient.invalidateQueries(['contacts']);
  }, [queryClient]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchInput]);

  useEffect(() => {
    clearSelectedContact();
  }, []);

  const handleClick = () => {
    setIsRedirecting(true);
    router.push('/contacts/add');
  };
  const totalPages = useMemo(() => data?.totalPages || 1, [data]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 700,
          height: 750,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: '#5c6ac4', p: 2 }}>
          <Typography variant="h6" color="#f7fafc" fontWeight="bold" textAlign="center">
            Contact Manager
          </Typography>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ p: 2, bgcolor: '#eef1f7', borderBottom: '1px solid #e2e8f0' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search contacts"
              fullWidth
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Checkbox checked={showFavouritesOnly} onChange={toggleFavouritesOnly} />
            <Typography variant="body2" color="#1e293b">
              Favourites
            </Typography>
          </Stack>
        </Box>

        {/* Contact List */}

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f7fafc' }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress color="primary" />
            </Box>
          ) : isError ? (
            <Typography align="center" color="error.main" mt={4}>
              Error fetching contacts.
            </Typography>
          ) : data?.contacts?.length ? (
            <List disablePadding>
              {data.contacts.map((contact) => (
                <Paper
                  key={contact.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    my: 1,
                    borderRadius: 1,
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#eef1f7' },
                  }}
                  onClick={() => setSelectedContact(contact)}
                >
                  <Box>
                    <Typography fontWeight={600} color="#1e293b">
                      {contact.name}
                    </Typography>
                    <Typography variant="body2" color="#6b7280">
                      {contact.email}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavourite(contact);
                    }}
                  >
                    {contact.favourite ? (
                      <StarIcon sx={{ color: '#ff8c42' }} />
                    ) : (
                      <StarBorderIcon sx={{ color: '#6b7280' }} />
                    )}
                  </IconButton>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography align="center" mt={4} color="#6b7280">
              No contacts found.
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#eef1f7',
            mt: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            flexWrap="wrap"
          >
            <Button
              size="small"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
              sx={{
                textTransform: 'none',
                color: 'blue',
                fontWeight: 500,
                '&:disabled': { color: '#c7c7d2' },
              }}
            >
              ← Previous
            </Button>

            <Typography
              variant="body2"
              color="#1e293b"
              sx={{ textAlign: 'center', flexGrow: 1 }}
            >
              Page {page} of {totalPages} | Total Records: {data?.totalCount || 0}
            </Typography>

            <Button
              size="small"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
              sx={{
                textTransform: 'none',
                color: 'blue',
                fontWeight: 500,
                '&:disabled': { color: '#c7c7d2' },
              }}
            >
              Next →
            </Button>
          </Stack>
        </Box>

        {/* Add Contact Button */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#fff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={handleClick}
            variant="contained"
            sx={{
              px: 3,
              py: 1,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              minWidth: 120,
              height: 40,
              bgcolor: '#5c6ac4',
              '&:hover': {
                bgcolor: '#3f51b5',
              },
            }}
          >
            {isRedirecting ? 'Loading...' : ' + Add Contact'}
          </Button>
        </Box>
        {selectedContact && <ContactModal />}
      </Paper>
    </Box>
  );
}
