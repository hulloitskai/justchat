import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type BuildInfoKeySpecifier = ('timestamp' | 'version' | BuildInfoKeySpecifier)[];
export type BuildInfoFieldPolicy = {
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>,
	version?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MessageKeySpecifier = ('body' | 'id' | 'sender' | 'timestamp' | MessageKeySpecifier)[];
export type MessageFieldPolicy = {
	body?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	sender?: FieldPolicy<any> | FieldReadFunction<any>,
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MessageAppendEventKeySpecifier = ('ch' | MessageAppendEventKeySpecifier)[];
export type MessageAppendEventFieldPolicy = {
	ch?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MessageEventKeySpecifier = ('append' | 'delete' | 'end' | 'start' | MessageEventKeySpecifier)[];
export type MessageEventFieldPolicy = {
	append?: FieldPolicy<any> | FieldReadFunction<any>,
	delete?: FieldPolicy<any> | FieldReadFunction<any>,
	end?: FieldPolicy<any> | FieldReadFunction<any>,
	start?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MessageStartEventKeySpecifier = ('ch' | 'sender' | MessageStartEventKeySpecifier)[];
export type MessageStartEventFieldPolicy = {
	ch?: FieldPolicy<any> | FieldReadFunction<any>,
	sender?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('sendEvent' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	sendEvent?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('buildInfo' | 'currentMessage' | 'message' | 'messages' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	buildInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	currentMessage?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>,
	messages?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SendEventPayloadKeySpecifier = ('event' | 'message' | 'ok' | SendEventPayloadKeySpecifier)[];
export type SendEventPayloadFieldPolicy = {
	event?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>,
	ok?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscriptionKeySpecifier = ('event' | SubscriptionKeySpecifier)[];
export type SubscriptionFieldPolicy = {
	event?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	BuildInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BuildInfoKeySpecifier | (() => undefined | BuildInfoKeySpecifier),
		fields?: BuildInfoFieldPolicy,
	},
	Message?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MessageKeySpecifier | (() => undefined | MessageKeySpecifier),
		fields?: MessageFieldPolicy,
	},
	MessageAppendEvent?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MessageAppendEventKeySpecifier | (() => undefined | MessageAppendEventKeySpecifier),
		fields?: MessageAppendEventFieldPolicy,
	},
	MessageEvent?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MessageEventKeySpecifier | (() => undefined | MessageEventKeySpecifier),
		fields?: MessageEventFieldPolicy,
	},
	MessageStartEvent?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MessageStartEventKeySpecifier | (() => undefined | MessageStartEventKeySpecifier),
		fields?: MessageStartEventFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	SendEventPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SendEventPayloadKeySpecifier | (() => undefined | SendEventPayloadKeySpecifier),
		fields?: SendEventPayloadFieldPolicy,
	},
	Subscription?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscriptionKeySpecifier | (() => undefined | SubscriptionKeySpecifier),
		fields?: SubscriptionFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;