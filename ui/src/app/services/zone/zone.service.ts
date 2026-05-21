import { Injectable } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';

export interface Zone {
  id: string;
  zone_code: string;
  zone_name: string;
  leader: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZoneInput {
  zone_code: string;
  zone_name: string;
  leader?: string | null;
  status?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private readonly gqlFolder = 'zones';

  constructor(private readonly graphql: GraphqlService) {}

  async getAll(): Promise<Zone[]> {
    const result = await this.graphql.requestFromFile<{ zones: Zone[] }>(
      this.gqlFolder,
      'zones.gql'
    );
    return result.zones;
  }

  async getById(id: string): Promise<Zone | null> {
    const result = await this.graphql.requestFromFile<{ zone: Zone | null }>(
      this.gqlFolder,
      'zone.gql',
      { id }
    );
    return result.zone;
  }

  async create(input: ZoneInput): Promise<Zone> {
    const result = await this.graphql.requestFromFile<{ createZone: Zone }>(
      this.gqlFolder,
      'create-zone.gql',
      { input }
    );
    return result.createZone;
  }

  async update(id: string, input: Partial<ZoneInput>): Promise<Zone> {
    const result = await this.graphql.requestFromFile<{ updateZone: Zone }>(
      this.gqlFolder,
      'update-zone.gql',
      { input: { id, ...input } }
    );
    return result.updateZone;
  }

  async delete(id: string): Promise<Zone | null> {
    const result = await this.graphql.requestFromFile<{ deleteZone: Zone | null }>(
      this.gqlFolder,
      'delete-zone.gql',
      { id }
    );
    return result.deleteZone;
  }
}
