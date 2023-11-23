'use client';

import { useEffect, useState } from 'react';
import { dnsServers } from '@/constants/dnsServers';
import { RecordTypes, type RecordType } from '@/constants/recordType';
import { HeartFilledIcon } from '@radix-ui/react-icons';
import { LoaderIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [advanedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>();
  const [recordType, setRecordType] = useState<RecordType>('A');

  const [previouslyChecked, setPreviouslyChecked] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const prevChecked = JSON.parse(localStorage.getItem('prevChecked') || '[]');
    return prevChecked;
  });
  const [resolvedAddresses, setResolvedAddresses] = useState<
    Record<string, string>
  >({});

  const checkDomain = async () => {
    if (!url) return;

    setLoading(true);
    const res = await fetch(`/api/check/${url}/${recordType || 'A'}`);
    const { addresses } = await res.json();

    // Add domain to previously checked localStorage
    const prevChecked = JSON.parse(localStorage.getItem('prevChecked') || '[]');
    if (!prevChecked.includes(url)) {
      prevChecked.unshift(url);
      if (typeof window !== 'undefined') {
        localStorage.setItem('prevChecked', JSON.stringify(prevChecked));
      }
    }
    setPreviouslyChecked(prevChecked);

    setResolvedAddresses(addresses);
    setLoading(false);
  };

  useEffect(() => {
    let int: NodeJS.Timeout;
    // Refresh interval
    if (refreshInterval) {
      int = setInterval(() => {
        checkDomain();
      }, refreshInterval * 1000);
    }

    return () => {
      if (int) clearInterval(int);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto py-14">
          <h1 className="font-heading text-3xl">Domain Checker</h1>
          <p className="mt-2 text-gray-500">
            Check if your domain is pointing to the right IP address.
          </p>
        </div>
      </div>
      <div className="mx-auto flex items-start w-full max-w-6xl gap-4 mt-10 flex-1 pb-14">
        <div className="max-w-md w-full space-y-6">
          <form
            className="rounded-md border border-gray-200 bg-white px-6 py-8"
            onSubmit={(e) => {
              e.preventDefault();
              checkDomain();
              return false;
            }}
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                Your domain
              </label>
            </div>
            <div className="relative mt-1 flex rounded-md shadow-sm">
              <Input
                type="text"
                name="url"
                id="url"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex justify-between mt-4">
              <Button type="submit">Check my domain</Button>
              <Button
                variant="link"
                onClick={() => setAdvancedOptionsOpen(!advanedOptionsOpen)}
              >
                Advanced options
              </Button>
            </div>

            {/* Advanced options */}
            {advanedOptionsOpen && (
              <div className="mt-4">
                <hr className="border-gray-200 my-4" />
                <h2 className="text-xs font-medium text-gray-700/60 mb-2">
                  Advanced options
                </h2>
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="refresh"
                      className="block space-x-1 text-sm font-medium text-gray-700"
                    >
                      <span>Refresh interval</span>
                      <span className="text-gray-500 text-xs">
                        (leave empty to disable)
                      </span>
                    </label>
                    d
                  </div>
                  <div className="relative mt-1 flex rounded-md shadow-sm">
                    <Input
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      type="number"
                      name="refresh"
                      id="refresh"
                      value={refreshInterval}
                      onChange={(e) =>
                        setRefreshInterval(parseInt(e.target.value, 10))
                      }
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 text-xs">
                      seconds
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mt-4">
                    <label
                      htmlFor="recordType"
                      className="block space-x-1 text-sm font-medium text-gray-700"
                    >
                      <span>Record Type</span>
                    </label>
                  </div>
                  <div className="relative mt-1 flex rounded-md shadow-sm">
                    <select
                      id="recordType"
                      name="recordType"
                      value={recordType}
                      onChange={(e) =>
                        setRecordType(e.target.value as RecordType)
                      }
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {Object.keys(RecordTypes).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Previous URLs */}
          <div className="rounded-md border border-gray-200 bg-white px-6 py-8">
            <div className="flex justify-between">
              <h2 className="text-md font-medium text-gray-700">
                Previously checked
              </h2>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('prevChecked', '[]');
                  }
                  setPreviouslyChecked([]);
                }}
                className="text-gray-500 text-xs"
              >
                Clear
              </button>
            </div>
            {previouslyChecked.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {previouslyChecked.map((url) => (
                  <li key={url}>
                    <button
                      onClick={() => setUrl(url)}
                      className="underline underline-offset-2 hover:underline-offset-4 text-sm text-gray-500"
                    >
                      {url}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-gray-500 text-sm">
                You haven&apos;t checked any domains yet.
              </p>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="space-y-2">
            {dnsServers.map((dnsServer) => (
              <div
                key={dnsServer.ip}
                className="rounded-md border border-gray-200 bg-white px-6 py-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-md font-medium text-gray-700">
                      {dnsServer.name}
                    </h2>
                    <p className="text-gray-500 text-xs">
                      {dnsServer.city}, {dnsServer.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <div className="animate-spin duration-[2000ms]">
                        <LoaderIcon />
                      </div>
                    ) : resolvedAddresses[dnsServer.name] ? (
                      <span className="text-green-500">
                        {resolvedAddresses[dnsServer.name]}
                      </span>
                    ) : url.length > 0 ? (
                      <span className="text-red-500">Not found</span>
                    ) : (
                      <span></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto py-4">
          <p className="mt-2 text-gray-500 text-xs flex items-center gap-1">
            Made by{' '}
            <a
              href="https://twitter.com/_cqeal"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lambert Weller
            </a>{' '}
            with <HeartFilledIcon className="inline-block w-3 h-3" /> in{' '}
            <a
              href="https://nextjs.org/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
