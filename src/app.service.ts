import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  async getApp() {
    return "ready";
  }
}
