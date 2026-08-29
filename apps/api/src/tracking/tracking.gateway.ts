import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

@WebSocketGateway()
export class TrackingGateway {
  constructor(private readonly trackingService: TrackingService) {}

  @SubscribeMessage('createTracking')
  create(@MessageBody() createTrackingDto: CreateTrackingDto) {
    return this.trackingService.create(createTrackingDto);
  }

  @SubscribeMessage('findAllTracking')
  findAll() {
    return this.trackingService.findAll();
  }

  @SubscribeMessage('findOneTracking')
  findOne(@MessageBody() id: number) {
    return this.trackingService.findOne(id);
  }

  @SubscribeMessage('updateTracking')
  update(@MessageBody() updateTrackingDto: UpdateTrackingDto) {
    return this.trackingService.update(updateTrackingDto.id, updateTrackingDto);
  }

  @SubscribeMessage('removeTracking')
  remove(@MessageBody() id: number) {
    return this.trackingService.remove(id);
  }
}
