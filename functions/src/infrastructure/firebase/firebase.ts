import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';

if (!admin.apps.length) {
	admin.initializeApp();
}

admin.firestore().settings({ ignoreUndefinedProperties: true });

export const firestore = (): Firestore => {
	return admin.firestore();
};

export const auth = (): Auth => {
	return admin.auth();
};
