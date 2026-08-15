import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// All Google Workspace requested scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.memberships',
  'https://www.googleapis.com/auth/chat.memberships.readonly',
];

export const googleAuthProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  googleAuthProvider.addScope(scope);
});

// Prompt consent to ensure refreshed access token
googleAuthProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory (never store in localStorage)
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedGoogleUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // When reloaded without in-memory token, prompt user to connect Google
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedGoogleUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google (interactive popup)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from OAuth credentials');
    }

    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Workspace Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve in-memory cached token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCachedUser = (): User | null => {
  return cachedGoogleUser;
};

// Logout
export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedGoogleUser = null;
};

/* =========================================================================
   GOOGLE DRIVE API INTEGRATION
   ========================================================================= */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export async function fetchDriveFiles(accessToken: string, query?: string): Promise<DriveFileItem[]> {
  try {
    let url = 'https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,iconLink,thumbnailLink)&orderBy=modifiedTime desc';
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Drive files: ${res.statusText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err: any) {
    console.error('Drive fetch error:', err);
    throw err;
  }
}

export async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  content: string | Blob,
  mimeType: string = 'text/plain'
): Promise<DriveFileItem> {
  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );

    const fileBlob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
    form.append('file', fileBlob);

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to upload to Google Drive: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Drive upload error:', err);
    throw err;
  }
}

/* =========================================================================
   GMAIL API INTEGRATION
   ========================================================================= */

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
}

export async function fetchGmailMessages(
  accessToken: string,
  maxResults: number = 10,
  query?: string
): Promise<GmailMessageSummary[]> {
  try {
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Gmail messages: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.messages || data.messages.length === 0) return [];

    // Fetch details for each message
    const detailed = await Promise.all(
      data.messages.slice(0, 10).map(async (msg: { id: string; threadId: string }) => {
        try {
          const mRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (!mRes.ok) return { id: msg.id, threadId: msg.threadId };
          const mData = await mRes.json();
          const headers = mData.payload?.headers || [];
          const getHeader = (name: string) =>
            headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: mData.snippet,
            subject: getHeader('Subject') || '(No Subject)',
            from: getHeader('From') || '',
            to: getHeader('To') || '',
            date: getHeader('Date') || '',
          };
        } catch {
          return { id: msg.id, threadId: msg.threadId };
        }
      })
    );

    return detailed;
  } catch (err: any) {
    console.error('Gmail fetch error:', err);
    throw err;
  }
}

// Convert message to RFC 2822 Base64 format and send
export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string; threadId: string }> {
  try {
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      bodyText,
    ];
    const message = messageParts.join('\r\n');

    // Base64url encode
    const encodedMessage = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send Gmail: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Gmail send error:', err);
    throw err;
  }
}

/* =========================================================================
   GOOGLE CHAT API INTEGRATION
   ========================================================================= */

export interface ChatSpaceItem {
  name: string; // "spaces/AAA..."
  displayName?: string;
  type?: string;
  spaceType?: string;
}

export interface ChatMessageItem {
  name: string;
  text: string;
  sender?: {
    displayName?: string;
    avatarUrl?: string;
  };
  createTime?: string;
}

export async function fetchChatSpaces(accessToken: string): Promise<ChatSpaceItem[]> {
  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=20', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Google Chat spaces: ${res.statusText}`);
    }

    const data = await res.json();
    return data.spaces || [];
  } catch (err: any) {
    console.error('Google Chat fetch spaces error:', err);
    throw err;
  }
}

export async function sendChatMessage(
  accessToken: string,
  spaceName: string,
  text: string
): Promise<ChatMessageItem> {
  try {
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send Google Chat message: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Google Chat send message error:', err);
    throw err;
  }
}
