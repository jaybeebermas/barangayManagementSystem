import { Injectable } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';
import { BarangayClearance } from './barangay-clearance.types';
import { CreateBarangayClearanceInput, UpdateBarangayClearanceInput } from './barangay-clearance.input';
import {
  GET_BARANGAY_CLEARANCES,
  GET_BARANGAY_CLEARANCE,
  CREATE_BARANGAY_CLEARANCE,
  UPDATE_BARANGAY_CLEARANCE,
  DELETE_BARANGAY_CLEARANCE,
  GENERATE_BARANGAY_CLEARANCE_PDF
} from './barangay-clearance.gql';

@Injectable({
  providedIn: 'root'
})
export class BarangayClearanceService {
  constructor(private readonly graphql: GraphqlService) {}

  async getAll(): Promise<BarangayClearance[]> {
    const result = await this.graphql.request<{ barangayClearances: BarangayClearance[] }>(
      GET_BARANGAY_CLEARANCES
    );
    return result.barangayClearances;
  }

  async getById(id: string): Promise<BarangayClearance | null> {
    const result = await this.graphql.request<{ barangayClearance: BarangayClearance | null }>(
      GET_BARANGAY_CLEARANCE,
      { id }
    );
    return result.barangayClearance;
  }

  async create(input: CreateBarangayClearanceInput): Promise<BarangayClearance> {
    const result = await this.graphql.request<{ createBarangayClearance: BarangayClearance }>(
      CREATE_BARANGAY_CLEARANCE,
      { input }
    );
    return result.createBarangayClearance;
  }

  async update(input: UpdateBarangayClearanceInput): Promise<BarangayClearance> {
    const result = await this.graphql.request<{ updateBarangayClearance: BarangayClearance }>(
      UPDATE_BARANGAY_CLEARANCE,
      { input }
    );
    return result.updateBarangayClearance;
  }

  async delete(id: string): Promise<BarangayClearance | null> {
    const result = await this.graphql.request<{ deleteBarangayClearance: BarangayClearance | null }>(
      DELETE_BARANGAY_CLEARANCE,
      { id }
    );
    return result.deleteBarangayClearance;
  }

  async generatePdf(id: string): Promise<string> {
    const result = await this.graphql.request<{ generateBarangayClearancePdf: string }>(
      GENERATE_BARANGAY_CLEARANCE_PDF,
      { id }
    );
    return result.generateBarangayClearancePdf;
  }
}
