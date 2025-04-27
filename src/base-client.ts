import Client from 'fhirclient/lib/Client.js';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter.js';
import type { fhirclient } from 'fhirclient/lib/types';

import type { FhirInterceptor, FhirRequest } from './interceptor';
import type { ClientOptions } from './types';

export class BaseClient {
	private baseClient: Client;
	private interceptors: FhirInterceptor[];

	constructor(
		{ serverUrl, ...rest }: ClientOptions,
		interceptors: FhirInterceptor[],
	) {
		this.interceptors = interceptors;
		const environment = new BrowserAdapter();
		this.baseClient = new Client(environment, {
			serverUrl,
			...rest,
		});
	}

	async request<T = any>(
		requestOptions: string | URL | fhirclient.RequestOptions,
		fhirOptions: fhirclient.FhirOptions = {},
	): Promise<T> {
		const options: fhirclient.RequestOptions =
			typeof requestOptions === 'string' || requestOptions instanceof URL
				? { url: String(requestOptions) }
				: { ...requestOptions };

		// request interceptors
		const request = this.interceptors
			.flatMap((i) => (i.type === 'request' ? [i.callback] : []))
			.reduce((opt, inter) => inter(opt), {
				requestOptions: options,
				fhirOptions,
			} satisfies FhirRequest);
		request.requestOptions.includeResponse = true;

		const resp: { body: any; response: Response } =
			await this.baseClient.request(
				request.requestOptions,
				request.fhirOptions,
			);

		// response interceptors
		this.interceptors
			.flatMap((r) => (r.type === 'response' ? [r.callback] : []))
			.map((i) => i(resp.response));
		return resp.body;
	}
}
