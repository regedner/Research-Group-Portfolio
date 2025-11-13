import { Typography, Box, Button, Container } from '@mui/material';
import { LinkedIn, Twitter, Mail, Public } from '@mui/icons-material';
import { ArrowRightIcon, AcademicCapIcon, BoltIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import ScrollAnimation from '../components/ScrollAnimation'; 

function HomePage() {
  return (
    <Box className="w-full min-h-screen flex flex-col items-center justify-start bg-gray-50">
      
      {/* 1. Hero Section - Mobil Optimize */}
      <div className="w-full min-h-[60vh] sm:h-[70vh] lg:h-[75vh] flex flex-col justify-center text-center bg-blue-700/90 text-white shadow-xl px-4" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(25, 118, 210, 0.8), rgba(25, 118, 210, 0.9)), url("https://images.unsplash.com/photo-1516321497487-e288fb197135?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
             backgroundSize: 'cover',
             backgroundPosition: 'center'
           }}>
        
        <Container maxWidth="md" className="pt-6 sm:pt-10 px-4 sm:px-6"> 
          <Typography 
            variant="h1" 
            component="h1" 
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 md:mb-12 drop-shadow-lg" 
          >
            Research Group Name
          </Typography>
        </Container>

        <Container maxWidth="md" className="px-4 sm:px-6 mt-auto mb-8 sm:mb-12 md:mb-16"> 
          <Typography 
            variant="h4" 
            component="p" 
            className="text-base sm:text-xl md:text-2xl lg:text-3xl font-light mb-6 sm:mb-8 md:mb-10 text-blue-100 drop-shadow px-2" 
          >
            Exploring the future of [Your Research Field] through innovative collaboration.
          </Typography>

          <div className="mt-4 sm:mt-6 md:mt-8"> 
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              to="/members"
              className="bg-white text-blue-700 hover:bg-blue-100 transition-colors font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg text-sm sm:text-base"
              endIcon={<ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
              sx={{ 
                backgroundColor: 'white', 
                color: '#1976d2', 
                '&:hover': { backgroundColor: 'rgb(220, 240, 255)' } 
              }}
            >
              Meet Our Team
            </Button>
          </div>
        </Container>
      </div>

      {/* 2. Research Areas - Mobil Grid */}
      <Container maxWidth="lg" className="py-12 sm:py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <ScrollAnimation animationType="fade-up">
          <Typography 
            variant="h3" 
            component="h2" 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-0 text-center px-4" 
          >
            Our Core Research
          </Typography>
        </ScrollAnimation>
        
        <div className="h-8 sm:h-12 md:h-16"></div> 
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 items-stretch">
          
          {/* Research Area 1 */}
          <ScrollAnimation animationType="fade-up" delay={100}>
            <Box className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 h-full">
              <AcademicCapIcon className='h-7 w-7 sm:h-8 sm:w-8 text-blue-600 mb-4 sm:mb-5'/>
              <Typography variant="h5" className="font-semibold text-blue-600 mb-3 sm:mb-4 text-lg sm:text-xl">
                [Area 1 Title]
              </Typography>
              <Typography className="text-gray-600 text-sm sm:text-base">
                Description of the first major research area or project.
              </Typography>
            </Box>
          </ScrollAnimation>
          
          {/* Research Area 2 */}
          <ScrollAnimation animationType="fade-up" delay={300}>
            <Box className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 h-full">
              <BoltIcon className='h-7 w-7 sm:h-8 sm:w-8 text-blue-600 mb-4 sm:mb-5'/>
              <Typography variant="h5" className="font-semibold text-blue-600 mb-3 sm:mb-4 text-lg sm:text-xl">
                [Area 2 Title]
              </Typography>
              <Typography className="text-gray-600 text-sm sm:text-base">
                Detailed summary of the second key project, focusing on its impact.
              </Typography>
            </Box>
          </ScrollAnimation>

          {/* Research Area 3 */}
          <ScrollAnimation animationType="fade-up" delay={500}>
            <Box className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 h-full sm:col-span-2 lg:col-span-1">
              <LinkIcon className='h-7 w-7 sm:h-8 sm:w-8 text-blue-600 mb-4 sm:mb-5'/>
              <Typography variant="h5" className="font-semibold text-blue-600 mb-3 sm:mb-4 text-lg sm:text-xl">
                [Area 3 Title]
              </Typography>
              <Typography className="text-gray-600 text-sm sm:text-base">
                The third core focus area. Mention recent findings or collaborations.
              </Typography>
            </Box>
          </ScrollAnimation>
        </div>
      </Container>
      
      {/* 3. Publications CTA - Mobil Optimize */}
      <ScrollAnimation animationType="fade-in" delay={100}>
        <Box 
          className="w-full py-12 sm:py-16 md:py-20 lg:py-28 px-4"
          style={{ 
            backgroundImage: 'linear-gradient(to right, #1976d2, #4c92ff)', 
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.25)' 
          }}
        >
          <Container maxWidth="md" className="text-center px-4 sm:px-6 lg:px-8">
            <Typography 
              variant="h3" 
              component="h3" 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-8 sm:mb-12 md:mb-16 drop-shadow-md"
            >
              See Our Impact
            </Typography>
            <Typography 
              className="text-sm sm:text-base md:text-lg text-blue-100 drop-shadow-sm mb-8 sm:mb-12 md:mb-16 px-2"
            >
              Review all our peer-reviewed articles and conference presentations and explore the results of our research efforts.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              to="/members" 
              className="bg-white text-blue-700 hover:bg-blue-100 transition-colors font-semibold py-2 sm:py-3 px-6 sm:px-10 rounded-full shadow-xl transform hover:scale-105 text-sm sm:text-base"
              sx={{ 
                backgroundColor: 'white', 
                color: '#1976d2', 
                '&:hover': { backgroundColor: 'rgb(220, 240, 255)' } 
              }}
            >
              Explore Publications
            </Button>
          </Container>
        </Box>
      </ScrollAnimation>
    </Box>
  );
}

export default HomePage;