import { Injectable, signal, inject } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';

@Injectable({
    providedIn: 'root'
})
export class BarangayConfigService {
    logoUrl = signal<string | null>(null);
    private readonly gql = inject(GraphqlService);

    constructor() {
        this.fetchLogo();
    }

    async fetchLogo(): Promise<void> {
        console.log('BarangayConfigService: fetchLogo started');
        try {
            const response = await this.gql.requestFromFile<{ barangaySetting: any }>(
                'settings',
                'barangay-setting.gql'
            );
            console.log('BarangayConfigService: GraphQL response:', response);
            if (response?.barangaySetting?.logo_path) {
                console.log('BarangayConfigService: Found logo_path:', response.barangaySetting.logo_path);
                this.updateLogo(response.barangaySetting.logo_path);
            } else {
                console.log('BarangayConfigService: No logo_path found in response');
            }
        } catch (e) {
            console.error('BarangayConfigService: Failed to load global config', e);
        }
    }

    updateLogo(path: string | null): void {
        if (path) {
            this.logoUrl.set(`/storage/${path}`);
        } else {
            this.logoUrl.set(null);
        }
    }
}
