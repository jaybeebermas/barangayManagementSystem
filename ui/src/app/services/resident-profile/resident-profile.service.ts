import { Injectable } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';
import { ResidentProfile } from './resident-profile.types';
import { CreateResidentProfileInput, UpdateResidentProfileInput } from './resident-profile.input';
import { GET_RESIDENT_PROFILES, GET_RESIDENT_PROFILE, CREATE_RESIDENT_PROFILE, UPDATE_RESIDENT_PROFILE, DELETE_RESIDENT_PROFILE } from './resident-profile.gql';

@Injectable({
  providedIn: 'root'
})
export class ResidentProfileService {
  constructor(private readonly graphql: GraphqlService) {}

  async getAll(): Promise<ResidentProfile[]> {
    const result = await this.graphql.request<{ residentProfiles: ResidentProfile[] }>(
      GET_RESIDENT_PROFILES
    );
    return result.residentProfiles;
  }

  async getById(id: string): Promise<ResidentProfile | null> {
    const result = await this.graphql.request<{ residentProfile: ResidentProfile | null }>(
      GET_RESIDENT_PROFILE,
      { id }
    );
    return result.residentProfile;
  }

  async create(input: CreateResidentProfileInput): Promise<ResidentProfile> {
    const result = await this.graphql.request<{ createResidentProfile: ResidentProfile }>(
      CREATE_RESIDENT_PROFILE,
      { input }
    );
    return result.createResidentProfile;
  }

  async update(input: UpdateResidentProfileInput): Promise<ResidentProfile> {
    const result = await this.graphql.request<{ updateResidentProfile: ResidentProfile }>(
      UPDATE_RESIDENT_PROFILE,
      { input }
    );
    return result.updateResidentProfile;
  }

  async delete(id: string): Promise<ResidentProfile | null> {
    const result = await this.graphql.request<{ deleteResidentProfile: ResidentProfile | null }>(
      DELETE_RESIDENT_PROFILE,
      { id }
    );
    return result.deleteResidentProfile;
  }
}
