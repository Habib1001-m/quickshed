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

type DerElement = { tag: number; contentStart: number; end: number };

function readDerElement(bytes: Uint8Array, offset: number, limit = bytes.length): DerElement | null {
  if (offset < 0 || offset + 2 > limit || offset + 2 > bytes.length) return null;

  const tag = bytes[offset];
  const lengthByte = bytes[offset + 1];
  let length = lengthByte;
  let headerSize = 2;
  if (lengthByte & 0x80) {
    const lengthBytes = lengthByte & 0x7f;
    if (lengthBytes === 0 || lengthBytes > 4 || offset + 2 + lengthBytes > limit) return null;
    length = 0;
    for (let i = 0; i < lengthBytes; i++) length = length * 256 + bytes[offset + 2 + i];
    headerSize += lengthBytes;
  }

  const contentStart = offset + headerSize;
  const end = contentStart + length;
  return end <= limit ? { tag, contentStart, end } : null;
}

function readDerChildren(bytes: Uint8Array, sequence: DerElement): DerElement[] | null {
  const children: DerElement[] = [];
  for (let offset = sequence.contentStart; offset < sequence.end;) {
    const child = readDerElement(bytes, offset, sequence.end);
    if (!child) return null;
    children.push(child);
    offset = child.end;
  }
  return children;
}

function parseDerTime(bytes: Uint8Array, element: DerElement): Date | null {
  const value = String.fromCharCode(...bytes.slice(element.contentStart, element.end));
  const match = element.tag === 0x17
    ? value.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
    : element.tag === 0x18
      ? value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
      : null;
  if (!match) return null;

  const yearValue = Number(match[1]);
  const year = element.tag === 0x17
    ? (yearValue >= 50 ? 1900 + yearValue : 2000 + yearValue)
    : yearValue;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
    ? date
    : null;
}

function readCertificateDates(decoded: string): Date[] | null {
  const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
  if (bytes.length < 64) return null;

  const certificate = readDerElement(bytes, 0);
  if (!certificate || certificate.tag !== 0x30 || certificate.end !== bytes.length) return null;

  const certificateChildren = readDerChildren(bytes, certificate);
  if (!certificateChildren || certificateChildren.length !== 3) return null;
  const [tbsCertificate, signatureAlgorithm, signatureValue] = certificateChildren;
  if (tbsCertificate.tag !== 0x30 || signatureAlgorithm.tag !== 0x30 || signatureValue.tag !== 0x03) return null;
  if (signatureValue.contentStart === signatureValue.end) return null;

  const tbsChildren = readDerChildren(bytes, tbsCertificate);
  if (!tbsChildren) return null;
  const firstField = tbsChildren[0]?.tag === 0xa0 ? 1 : 0;
  const requiredTags = [0x02, 0x30, 0x30, 0x30, 0x30, 0x30];
  if (tbsChildren.length < firstField + requiredTags.length) return null;
  if (!requiredTags.every((tag, index) => tbsChildren[firstField + index]?.tag === tag)) return null;

  const tbsSignatureAlgorithm = tbsChildren[firstField + 1];
  const issuer = tbsChildren[firstField + 2];
  const validity = tbsChildren[firstField + 3];
  const subject = tbsChildren[firstField + 4];
  const subjectPublicKeyInfo = tbsChildren[firstField + 5];
  const signatureAlgorithmChildren = readDerChildren(bytes, signatureAlgorithm);
  const tbsAlgorithmChildren = readDerChildren(bytes, tbsSignatureAlgorithm);
  const issuerChildren = readDerChildren(bytes, issuer);
  const validityChildren = readDerChildren(bytes, validity);
  const subjectChildren = readDerChildren(bytes, subject);
  const publicKeyChildren = readDerChildren(bytes, subjectPublicKeyInfo);
  const hasOid = (element: DerElement | undefined) =>
    element?.tag === 0x06 && element.contentStart < element.end;
  if (!signatureAlgorithmChildren || !hasOid(signatureAlgorithmChildren[0])) return null;
  if (!tbsAlgorithmChildren || !hasOid(tbsAlgorithmChildren[0])) return null;
  if (!issuerChildren?.some((element) => element.tag === 0x31)) return null;
  if (!subjectChildren?.some((element) => element.tag === 0x31)) return null;
  if (publicKeyChildren?.[0]?.tag !== 0x30 || publicKeyChildren[1]?.tag !== 0x03) return null;
  if (publicKeyChildren[1].contentStart === publicKeyChildren[1].end) return null;
  if (!validityChildren || validityChildren.length < 2) return null;
  const notBefore = parseDerTime(bytes, validityChildren[0]);
  const notAfter = parseDerTime(bytes, validityChildren[1]);
  return notBefore && notAfter ? [notBefore, notAfter] : null;
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
  validFromTimestamp: number;
  validTo: string;
  validToTimestamp: number;
  serialNumber: string;
  algorithm: string;
  raw: string;
}

function parseCertificate(pem: string): CertInfo | null {
  const b64 = pem.replace(/-----BEGIN CERTIFICATE-----/, '').replace(/-----END CERTIFICATE-----/, '').replace(/\s/g, '');
  if (!b64) return null;
  const decoded = decodeBase64(b64);
  const dates = decoded ? readCertificateDates(decoded) : null;
  if (!decoded || !dates) return null;

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

  const validFrom = dates[0].toLocaleDateString();
  const validTo = dates[1].toLocaleDateString();

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
    validFromTimestamp: dates[0].getTime(),
    validTo,
    validToTimestamp: dates[1].getTime(),
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

  const getStatus = (validFromTimestamp: number, validToTimestamp: number): 'valid' | 'expired' | 'notYetValid' => {
    const now = Date.now();
    if (!Number.isFinite(validFromTimestamp) || !Number.isFinite(validToTimestamp) || now < validFromTimestamp) {
      return 'notYetValid';
    }
    return now > validToTimestamp ? 'expired' : 'valid';
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
                const status = getStatus(cert.validFromTimestamp, cert.validToTimestamp);
                return (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{i + 1}</span>
                      {status === 'valid' ? (
                        <Badge className="bg-emerald-500"><CheckCircle className="size-3 me-1" />{t.valid}</Badge>
                      ) : status === 'expired' ? (
                        <Badge variant="destructive"><XCircle className="size-3 me-1" />{t.expired}</Badge>
                      ) : (
                        <Badge variant="secondary"><AlertTriangle className="size-3 me-1" />{t.notYetValid}</Badge>
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
