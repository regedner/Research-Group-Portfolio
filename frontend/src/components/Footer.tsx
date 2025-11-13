import { Typography, Box, Container } from '@mui/material';
import { LinkedIn, Twitter, Mail, Public } from '@mui/icons-material';

function Footer() {
  return (
    <Box className="w-full bg-gray-900 py-8 sm:py-12">
      <Container maxWidth="lg" className="px-4 sm:px-6 lg:px-8">
        
        {/* Üst Kısım */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 border-b border-gray-700 pb-6 sm:pb-8 mb-6 sm:mb-8">
          <div className="text-center md:text-left">
            <Typography variant="h5" component="h3" className="text-xl sm:text-2xl font-bold text-white mb-2">
              Research Group Name
            </Typography>
            <Typography className="text-gray-400 text-sm sm:text-base max-w-sm">
              Join us in exploring the future of [Your Research Field].
            </Typography>
          </div>
          
          {/* Sosyal Medya İkonları */}
          <div className="flex space-x-4 sm:space-x-6">
            <a href="#" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-blue-500 transition-colors" title="LinkedIn">
              <LinkedIn sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-blue-400 transition-colors" title="Twitter/X">
              <Twitter sx={{ fontSize: { xs: 28, sm: 32 } }} /> 
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-indigo-400 transition-colors" title="BlueSky">
              <Public sx={{ fontSize: { xs: 28, sm: 32 } }} /> 
            </a>
            <a href="mailto:research@group.com" 
               className="text-gray-400 hover:text-red-500 transition-colors" title="Email">
              <Mail sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </a>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="text-center space-y-2 text-xs sm:text-sm">
          <Typography className="text-gray-500">
            &copy; {new Date().getFullYear()} Research Group Name. All rights reserved.
          </Typography>
          <Typography className="text-gray-500">
            Designed by <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Your Name / Project Name</a>
          </Typography>
        </div>
        
      </Container>
    </Box>
  );
}

export default Footer;