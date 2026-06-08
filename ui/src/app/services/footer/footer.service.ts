import { Injectable, inject, signal } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';
import { GET_FOOTERS, CREATE_FOOTER, UPDATE_FOOTER, DELETE_FOOTER, GET_ACTIVE_FOOTER } from './footer.gql';
import { Footer } from './footer.types';

@Injectable({
    providedIn: 'root'
})
export class FooterService {
    private readonly gql = inject(GraphqlService);
    activeFooterSignal = signal<Footer | null>(null);

    async getActive(): Promise<Footer | null> {
        const res = await this.gql.request<{ activeFooter: Footer | null }>(GET_ACTIVE_FOOTER);
        this.activeFooterSignal.set(res.activeFooter);
        return res.activeFooter;
    }


    async getAll(): Promise<Footer[]> {
        const res = await this.gql.request<{ footers: Footer[] }>(GET_FOOTERS);
        return res.footers || [];
    }

    async create(input: any): Promise<Footer> {
        const res = await this.gql.request<{ createFooter: Footer }>(CREATE_FOOTER, { input });
        return res.createFooter;
    }

    async update(input: any): Promise<Footer> {
        const res = await this.gql.request<{ updateFooter: Footer }>(UPDATE_FOOTER, { input });
        return res.updateFooter;
    }

    async delete(id: string): Promise<Footer> {
        const res = await this.gql.request<{ deleteFooter: Footer }>(DELETE_FOOTER, { id });
        return res.deleteFooter;
    }
}
