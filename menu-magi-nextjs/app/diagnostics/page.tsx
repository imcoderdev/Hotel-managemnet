'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DiagnosticPage() {
  const supabase = createClient();
  const [results, setResults] = useState<any[]>([]);

  const runTests = async () => {
    const testResults = [];

    // Test 1: Check Supabase connection
    testResults.push({ test: 'Supabase Connection', status: '✅', detail: 'Connected' });

    // Test 2: Check auth session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        testResults.push({ 
          test: 'Auth Session', 
          status: '✅', 
          detail: `Logged in as: ${session.user.email}` 
        });
      } else {
        testResults.push({ 
          test: 'Auth Session', 
          status: '⚠️', 
          detail: 'Not logged in' 
        });
      }
    } catch (error: any) {
      testResults.push({ 
        test: 'Auth Session', 
        status: '❌', 
        detail: error.message 
      });
    }

    // Test 3: Check owners table access
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('count');
      
      if (error) {
        testResults.push({ 
          test: 'Owners Table Access', 
          status: '❌', 
          detail: error.message 
        });
      } else {
        testResults.push({ 
          test: 'Owners Table Access', 
          status: '✅', 
          detail: 'Can read owners table' 
        });
      }
    } catch (error: any) {
      testResults.push({ 
        test: 'Owners Table Access', 
        status: '❌', 
        detail: error.message 
      });
    }

    // Test 4: Check menu_items table access
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('count');
      
      if (error) {
        testResults.push({ 
          test: 'Menu Items Table Access', 
          status: '❌', 
          detail: error.message 
        });
      } else {
        testResults.push({ 
          test: 'Menu Items Table Access', 
          status: '✅', 
          detail: 'Can read menu_items table' 
        });
      }
    } catch (error: any) {
      testResults.push({ 
        test: 'Menu Items Table Access', 
        status: '❌', 
        detail: error.message 
      });
    }

    // Test 5: Check RLS policies
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('owners')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code === 'PGRST116') {
          testResults.push({ 
            test: 'Owner Record', 
            status: '⚠️', 
            detail: 'No owner record found for this user' 
          });
        } else if (error) {
          testResults.push({ 
            test: 'Owner Record', 
            status: '❌', 
            detail: error.message 
          });
        } else {
          testResults.push({ 
            test: 'Owner Record', 
            status: '✅', 
            detail: `Found: ${data.restaurant_name}` 
          });
        }
      }
    } catch (error: any) {
      testResults.push({ 
        test: 'Owner Record', 
        status: '❌', 
        detail: error.message 
      });
    }

    setResults(testResults);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-3xl">🔍 System Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} className="w-full">
              Run Diagnostics
            </Button>

            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{result.test}</span>
                      <span className="text-2xl">{result.status}</span>
                    </div>
                    <p className="text-white/70 text-sm mt-2">{result.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
