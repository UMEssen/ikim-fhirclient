import type { BaseClientTypeOptions } from './client';
import type { ReadInput } from './read';

export interface VReadInput<
	TypeOptions extends BaseClientTypeOptions,
	ResType extends TypeOptions['resourceTypes'],
> extends ReadInput<TypeOptions, ResType> {
	version: string;
}
