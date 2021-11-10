import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type BuildInfoKeySpecifier = ('timestamp' | 'version' | BuildInfoKeySpecifier)[];
export type BuildInfoFieldPolicy = {
	timestamp?: FieldPolicy<any> | FieldReadFunction<any>,
	version?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventKeySpecifier = ('key' | 'message' | EventKeySpecifier)[];
export type EventFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MessageKeySpecifier = ('body' | 'createdAt' | 'expiresAt' | 'id' | 'senderHandle' | 'updatedAt' | MessageKeySpecifier)[];
export type MessageFieldPolicy = {
	body?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	expiresAt?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	senderHandle?: FieldPolicy<any> | FieldReadFunction<any>,
	updatedAt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('testFailure' | 'update' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	testFailure?: FieldPolicy<any> | FieldReadFunction<any>,
	update?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('buildInfo' | 'currentMessage' | 'message' | 'messages' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	buildInfo?: FieldPolicy<any> | FieldReadFunction<any>,
	currentMessage?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>,
	messages?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscriptionKeySpecifier = ('event' | SubscriptionKeySpecifier)[];
export type SubscriptionFieldPolicy = {
	event?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TestFailurePayloadKeySpecifier = ('ok' | TestFailurePayloadKeySpecifier)[];
export type TestFailurePayloadFieldPolicy = {
	ok?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdatePayloadKeySpecifier = ('currentMessage' | 'ok' | UpdatePayloadKeySpecifier)[];
export type UpdatePayloadFieldPolicy = {
	currentMessage?: FieldPolicy<any> | FieldReadFunction<any>,
	ok?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	BuildInfo?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | BuildInfoKeySpecifier | (() => undefined | BuildInfoKeySpecifier),
		fields?: BuildInfoFieldPolicy,
	},
	Event?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventKeySpecifier | (() => undefined | EventKeySpecifier),
		fields?: EventFieldPolicy,
	},
	Message?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MessageKeySpecifier | (() => undefined | MessageKeySpecifier),
		fields?: MessageFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	Subscription?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscriptionKeySpecifier | (() => undefined | SubscriptionKeySpecifier),
		fields?: SubscriptionFieldPolicy,
	},
	TestFailurePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TestFailurePayloadKeySpecifier | (() => undefined | TestFailurePayloadKeySpecifier),
		fields?: TestFailurePayloadFieldPolicy,
	},
	UpdatePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdatePayloadKeySpecifier | (() => undefined | UpdatePayloadKeySpecifier),
		fields?: UpdatePayloadFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;