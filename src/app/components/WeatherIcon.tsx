import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbCloudyIcon from '@mui/icons-material/WbCloudy';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import NightsStayIcon from '@mui/icons-material/NightsStay';

interface WeatherIconProps {
  symbol: string;
  size?: number;
}

export function WeatherIcon({ symbol, size = 64 }: WeatherIconProps) {
  const iconStyle = {
    width: size,
    height: size,
  };

  const getIcon = () => {
    switch (symbol) {
      case 'clearsky_day':
      case 'fair_day':
        return <WbSunnyIcon sx={{ ...iconStyle, color: '#F59E0B' }} />;
      
      case 'partlycloudy_day':
        return <WbCloudyIcon sx={{ ...iconStyle, color: '#78716C' }} />;
      
      case 'cloudy':
        return <CloudIcon sx={{ ...iconStyle, color: '#78716C' }} />;
      
      case 'rain':
      case 'lightrain':
        return <GrainIcon sx={{ ...iconStyle, color: '#3B82F6' }} />;
      
      case 'clearsky_night':
      case 'fair_night':
      case 'partlycloudy_night':
        return <NightsStayIcon sx={{ ...iconStyle, color: '#FBBF24' }} />;
      
      default:
        return <CloudIcon sx={{ ...iconStyle, color: '#78716C' }} />;
    }
  };

  return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon()}</div>;
}