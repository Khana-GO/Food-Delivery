import { MapsService } from './src/maps/maps.service';

async function test() {
  const service = new MapsService();
  console.log('Testing coordinate to coordinate...');
  const origin = { latitude: 27.7172, longitude: 85.3240 }; // Kathmandu
  const dest = { latitude: 27.6766, longitude: 85.3142 }; // Patan
  
  const result1 = await service.getDistanceAndDuration(origin, dest);
  console.log('Result 1:', result1);

  console.log('Testing address to address...');
  const addrOrigin = "Thamel, Kathmandu, Nepal";
  const addrDest = "Patan Durbar Square, Lalitpur, Nepal";

  const result2 = await service.getDistanceAndDuration(addrOrigin, addrDest);
  console.log('Result 2:', result2);
}

test().catch(console.error);
