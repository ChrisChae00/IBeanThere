'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, Check, X } from 'lucide-react';
import { SearchIcon } from '@/components/ui';
import { Session } from '@supabase/supabase-js';
import { UserPublicResponse, TrustedUser } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';

interface UserSearchSectionProps {
  session: Session | null;
  trustedUsernames: Set<string>;
  onTrustUpdate: () => void;
}

export default function UserSearchSection({ session, trustedUsernames, onTrustUpdate }: UserSearchSectionProps) {
  const t = useTranslations('community');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserPublicResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/search?query=${encodeURIComponent(debouncedQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleTrust = async (username: string) => {
    if (!session?.access_token) return;

    try {
      const isTrusted = trustedUsernames.has(username);
      const method = isTrusted ? 'DELETE' : 'POST';
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${username}/trust`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        onTrustUpdate();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to update trust');
      }
    } catch (err) {
      console.error('Trust action failed:', err);
    }
  };

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <SearchIcon size={16} />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={t('search_users_placeholder')}
          className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[var(--color-primary)] bg-background focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown/List */}
      {query.length >= 2 && results.length > 0 && (
        <div className="mt-2 bg-[var(--color-card-background)] rounded-lg border border-border shadow-lg overflow-hidden">
          {results.map((user) => {
            const isTrusted = trustedUsernames.has(user.username);
            const isMe = session?.user?.user_metadata?.username === user.username; // Basic check

            if (isMe) return null;

            return (
              <div key={user.username} className="flex items-center justify-between p-3 hover:bg-[var(--color-surface-hover)] transition-colors border-b border-border last:border-0">
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.display_name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--color-text)]">{user.display_name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">@{user.username}</p>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation when clicking follow
                    e.stopPropagation();
                    handleTrust(user.username);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ml-3
                    ${isTrusted 
                      ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-500 hover:border-red-200' 
                      : 'bg-[var(--color-primary)] text-white hover:opacity-90'
                    }`}
                >
                  {isTrusted ? (
                    <>
                      <Check className="w-3 h-3" />
                      {t('following')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      {t('follow')}
                    </>
                  )}
                </button>

              </div>
            );
          })}
        </div>
      )}
      
      {query.length >= 2 && results.length === 0 && !isSearching && (
        <div className="mt-2 text-center p-4 text-sm text-muted-foreground bg-[var(--color-surface)] rounded-lg border border-border">
          {t('no_users_found')}
        </div>
      )}
    </div>
  );
}
