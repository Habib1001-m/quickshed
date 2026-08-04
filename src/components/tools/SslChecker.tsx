'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const labels = {
  en: {
    title: 'SSL Certificate Parser',
    note: 'This tool parses certificate data locally. No data is sent to any server.',
    placeholder: 'Paste your SSL certificate in PEM format here...\n\n-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV...\n-----END CERTIFICATE-----',
    parse: 'Parse Certificate',
    parsedInfo: 'Certificate Information',
    subject: 'Subject',
    issuer: 'Issuer',
    validFrom: 'Valid From',
    validTo: 'Valid To',
    serialNumber: 'Serial Number',
    algorithm: 'Signature Algorithm',
    status: 'Status',
    valid: 'Valid',
    expired: 'Expired',
    notYetValid: 'Not Yet Valid',
    chain: 'Certificate Chain',
    certificates: 'certificate(s) found',
    noCert: 'Could not parse the certificate. Please paste a valid PEM certificate.',
    daysRemaining: 'days remaining',
    daysAgo: 'days ago',
  },
  ar: {
    title: 'محلل شهادة SSL',
    note: 'هذه الأداة تحلل بيانات الشهادة محلياً. لا يتم إرسال أي بيانات لأي خادم.',
    placeholder: 'الصق شهادة SSL بتنسيق PEM هنا...\n\n-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV...\n-----END CERTIFICATE-----',
    parse: 'تحليل الشهادة',
    parsedInfo: 'معلومات الشهادة',
    subject: 'الموضوع',
    issuer: 'المُصدر',
    validFrom: 'صالحة من',
    validTo: 'صالحة إلى',
    serialNumber: 'الرقم التسلسلي',
    algorithm: 'خوارزمية التوقيع',
    status: 'الحالة',
    valid: 'صالحة',
    expired: 'منتهية',
    notYetValid: 'غير صالحة بعد',
    chain: 'سلسلة الشهادات',
    certificates: 'شهادة/شهادات موجودة',
    noCert: 'لم يتم تحليل الشهادة. الصق شهادة PEM صالحة.',
    daysRemaining: 'يوم متبقي',
    daysAgo: 'يوم مضى',
  },
};

function decodeBase64(str: string): string {
  try {
    return atob(str.replace(/\s/g, ''));
  } catch {
    return '';
  }
}

function parseDN(asn1: string): string {
  const parts: string[] = [];
  const cnMatch = asn1.match(/CN=([^,\n]+)/);
  const oMatch = asn1.match(/O=([^,\n]+)/);
  const ouMatch = asn1.match(/OU=([^,\n]+)/);
  const cMatch = asn1.match(/C=([^,\n]+)/);
  const stMatch = asn1.match(/ST=([^,\n]+)/);
  const lMatch = asn1.match(/L=([^,\n]+)/);
  if (cnMatch) parts.push(`CN=${cnMatch[1].trim()}`);
  if (oMatch) parts.push(`O=${oMatch[1].trim()}`);
  if (ouMatch) parts.push(`OU=${ouMatch[1].trim()}`);
  if (cMatch) parts.push(`C=${cMatch[1].trim()}`);
  if (stMatch) parts.push(`ST=${stMatch[1].trim()}`);
  if (lMatch) parts.push(`L=${lMatch[1].trim()}`);
  return parts.length > 0 ? parts.join(', ') : asn1.slice(0, 80);
}

interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  algorithm: string;
  raw: string;
}

function parseCertificate(pem: string): CertInfo | null {
  const b64 = pem.replace(/-----BEGIN CERTIFICATE-----/, '').replace(/-----END CERTIFICATE-----/, '').replace(/\s/g, '');
  if (!b64) return null;
  const decoded = decodeBase64(b64);
  if (!decoded) return null;

  // Extract text-readable portions from the DER-encoded data
  const textParts: string[] = [];
  for (let i = 0; i < decoded.length; i++) {
    if (decoded.charCodeAt(i) >= 32 && decoded.charCodeAt(i) < 127) {
      let str = '';
      while (i < decoded.length && decoded.charCodeAt(i) >= 32 && decoded.charCodeAt(i) < 127) {
        str += decoded[i];
        i++;
      }
      if (str.length > 2) textParts.push(str);
    }
  }

  const fullText = textParts.join('\n');

  // Extract OID info
  const algorithm = fullText.match(/sha(256|384|512|1)WithRSAEncryption/i)?.[0]
    || fullText.match(/ecdsa-with-SHA(256|384)/i)?.[0]
    || fullText.match(/SHA(256|384|1)WithRSA/i)?.[0]
    || 'Unknown';

  // Try to find dates (ASN.1 UTCTime format: YYMMDDHHMMSSZ)
  const datePattern = /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z/g;
  const dates: Date[] = [];
  let dateMatch;
  while ((dateMatch = datePattern.exec(fullText)) !== null) {
    const year = parseInt(dateMatch[1]) >= 50 ? 1900 + parseInt(dateMatch[1]) : 2000 + parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    const hour = parseInt(dateMatch[4]);
    const min = parseInt(dateMatch[5]);
    const sec = parseInt(dateMatch[6]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      dates.push(new Date(year, month, day, hour, min, sec));
    }
  }

  const validFrom = dates.length > 0 ? dates[0].toLocaleDateString() : 'Unknown';
  const validTo = dates.length > 1 ? dates[1].toLocaleDateString() : 'Unknown';

  // Extract serial number (look for hex-like sequences near the start)
  let serialNumber = 'Unknown';
  const hexParts: string[] = [];
  for (let i = 0; i < Math.min(decoded.length, 50); i++) {
    const byte = decoded.charCodeAt(i);
    if (byte >= 0x20 && byte < 0x7f) continue;
    hexParts.push(byte.toString(16).padStart(2, '0'));
  }
  if (hexParts.length > 2) {
    serialNumber = hexParts.slice(0, 8).join(':').toUpperCase();
  }

  // Extract subject and issuer from text
  const subject = parseDN(fullText.substring(fullText.length / 2)) || 'Unknown';
  const issuer = parseDN(fullText.substring(0, fullText.length / 2)) || 'Unknown';

  return {
    subject,
    issuer,
    validFrom,
    validTo,
    serialNumber,
    algorithm,
    raw: fullText,
  };
}

export default function SslChecker({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [input, setInput] = useState('');
  const [certs, setCerts] = useState<CertInfo[]>([]);

  const handleParse = () => {
    const pemBlocks = input.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || [];
    const parsed: CertInfo[] = [];
    for (const pem of pemBlocks) {
      const cert = parseCertificate(pem);
      if (cert) parsed.push(cert);
    }
    if (parsed.length === 0) {
      // Try parsing as raw base64
      const cert = parseCertificate(input);
      if (cert) parsed.push(cert);
    }
    setCerts(parsed);
  };

  const getStatus = (validTo: string): 'valid' | 'expired' | 'notYetValid' => {
    try {
      const d = new Date(validTo);
      if (isNaN(d.getTime())) return 'valid';
      return d < new Date() ? 'expired' : 'valid';
    } catch {
      return 'valid';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Shield className="size-5" />
            {t.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{t.note}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="tool-input min-h-[200px] resize-y font-mono text-xs"
          />
          <Button onClick={handleParse} className="tool-action-btn">{t.parse}</Button>
        </CardContent>
      </Card>

      {certs.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.chain} — {certs.length} {t.certificates}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certs.map((cert, i) => {
                const status = getStatus(cert.validTo);
                return (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{i + 1}</span>
                      {status === 'valid' ? (
                        <Badge className="bg-emerald-500"><CheckCircle className="size-3 me-1" />{t.valid}</Badge>
                      ) : (
                        <Badge variant="destructive"><XCircle className="size-3 me-1" />{t.expired}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">{t.subject}:</span> <span className="font-mono text-xs break-all">{cert.subject}</span></div>
                      <div><span className="text-muted-foreground">{t.issuer}:</span> <span className="font-mono text-xs break-all">{cert.issuer}</span></div>
                      <div><span className="text-muted-foreground">{t.validFrom}:</span> {cert.validFrom}</div>
                      <div><span className="text-muted-foreground">{t.validTo}:</span> {cert.validTo}</div>
                      <div><span className="text-muted-foreground">{t.serialNumber}:</span> <span className="font-mono text-xs">{cert.serialNumber}</span></div>
                      <div><span className="text-muted-foreground">{t.algorithm}:</span> {cert.algorithm}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      {input && certs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="size-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm text-muted-foreground">{t.noCert}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
