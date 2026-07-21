import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboard() {
    // In a real app, verify that req.user is an ADMIN here
    return this.adminService.getDashboardMetrics();
  }
}
