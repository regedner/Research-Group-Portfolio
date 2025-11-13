import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home Page', path: '/' },
    { text: 'Members', path: '/members' },
  ];

  const drawer = (
    <div className="h-full bg-[#69043a]">
      <div className="flex justify-between items-center p-4 border-b border-white/20">
        <Typography variant="h6" className="text-white font-bold">
          Menu
        </Typography>
        <IconButton onClick={handleDrawerToggle} className="text-white">
          <CloseIcon />
        </IconButton>
      </div>
      <List className="pt-4">
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            className="text-white hover:bg-white/10 transition-colors py-4 px-6"
          >
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                className: 'text-white text-lg font-medium' 
              }} 
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      {/* Sticky Navbar - position="sticky" ekledik */}
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: '#69043a',
          top: 0,
          zIndex: 1100 // Drawer'dan düşük, modal'lardan yüksek
        }}
      >
        <Toolbar className="px-4 sm:px-6">
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="mr-2 md:hidden"
          >
            <MenuIcon />
          </IconButton>

          {/* Logo/Title */}
          <Typography 
            variant="h6" 
            className="flex-grow text-base sm:text-lg md:text-xl font-bold"
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            Researcher Groups
          </Typography>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={Link}
                to={item.path}
                className="text-sm lg:text-base"
              >
                {item.text}
              </Button>
            ))}
          </div>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            zIndex: 1200 // Navbar'dan yüksek
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;