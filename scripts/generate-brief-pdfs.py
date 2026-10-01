#!/usr/bin/env python3
import os

os.makedirs('briefs', exist_ok=True)

BRIEFS = {
    'brief-001.pdf': {
        'ref': 'BRIEF-001',
        'title': 'Sovereign Weights: Quantized 405B Models in Air-Gap',
        'sub': 'Zero-Egress Enclaves | Air-Gapped Systems 2026',
        'lines': [
            'STAGE-X.SPACE TECHNICAL ARCHITECTURE BRIEF',
            'License: MIT & Apache 2.0 | Classification: PUBLIC / AIR-GAP VALIDATED',
            '',
            'EXECUTIVE SUMMARY:',
            'Field deployment report on operating quantized 405B-class models inside zero-egress enclaves.',
            'Describes weight partitioning, memory layout, and deterministic token generation without',
            'external dependencies or call-home verification.',
            '',
            'KEY ARCHITECTURE PROOFS:',
            '1. Weight Layout: FP8 quantization with block-wise scaling preserves 99.4% benchmark parity.',
            '2. Memory Footprint: Fits on dual 8x H100 SXM nodes within local unified memory.',
            '3. Kernel Egress: Enforced via netfilter drop_all at Linux kernel boundary (0 bytes leaked).',
            '4. Verification: All inference outputs passed through strict confidence interlock gate.',
            '',
            'FIELD MEASUREMENTS:',
            '- P99 Cold Start TTFT: < 80ms on local weight storage',
            '- Egress Packets: 0 packets outbound across 90-day soak test',
            '- Requisition Time: Reduced from 72 hours to < 4 minutes',
        ]
    },
    'brief-002.pdf': {
        'ref': 'BRIEF-002',
        'title': 'Petabyte-Scale Telemetry Fusion at Industrial Fleets',
        'sub': 'High-Throughput Streaming & Asset Reliability 2025',
        'lines': [
            'STAGE-X.SPACE TECHNICAL ARCHITECTURE BRIEF',
            'License: MIT & Apache 2.0 | Classification: PUBLIC / INDUSTRIAL VALIDATED',
            '',
            'EXECUTIVE SUMMARY:',
            'Streaming vibrational and thermal waveforms into OSIsoft PI and SCADA historians across',
            '1,000+ rotating turbine and compressor assets without polling degradation.',
            '',
            'KEY ARCHITECTURE PROOFS:',
            '1. Ingestion: Direct memory-mapped ring buffers eliminate polling-based query pressure.',
            '2. Protocol Support: OPC-UA 1.04 binary protocol with fallback to raw Modbus/TCP.',
            '3. Memory Safety: In-place frame scoring using pooled pre-allocated buffers (zero heap allocs).',
            '4. Store-and-Forward: 72-hour offline buffer capacity for leased-line outage resilience.',
            '',
            'FIELD MEASUREMENTS:',
            '- Advance Warning Lead Time: 48 to 72 hours on mechanical failure modes',
            '- Historian Read Pressure: Reduced by 88% compared to legacy polling shims',
            '- Uptime Recorded: 99.2% availability across marine and plant deployments',
        ]
    },
    'brief-003.pdf': {
        'ref': 'BRIEF-003',
        'title': 'Sub-50ms TTFT Under Extreme Concurrent Load',
        'sub': 'Latency Engineering & Event-Driven Inference 2026',
        'lines': [
            'STAGE-X.SPACE TECHNICAL ARCHITECTURE BRIEF',
            'License: MIT & Apache 2.0 | Classification: PUBLIC / INFRASTRUCTURE VALIDATED',
            '',
            'EXECUTIVE SUMMARY:',
            'Holding sub-50ms Time-To-First-Token on smart-grid state estimation across five million',
            'concurrent telemetry streams under zero-data-retention constraints.',
            '',
            'KEY ARCHITECTURE PROOFS:',
            '1. Network Layer: AF_XDP kernel-bypass networking with pinned CPU thread affinity.',
            '2. Zero Retention: Ephemeral in-memory ring buffers cryptographically zeroed post-inference.',
            '3. Speculative Decode: Pipelined draft verification for rapid anomaly classification.',
            '4. Audit Logging: High-speed append-only syslog datagram output over Unix domain sockets.',
            '',
            'FIELD MEASUREMENTS:',
            '- P99 Time-To-First-Token: 44.8ms under 300% simulated load spike',
            '- Concurrency: Sustained 120,000 operations per second per server node',
            '- Memory Residue: 0 bytes retained post-session verification',
        ]
    },
    'brief-005.pdf': {
        'ref': 'BRIEF-005',
        'title': 'Zero-Knowledge Clinical Reasoning in Confidential Enclaves',
        'sub': 'PHI-Safe Pipelines & Cryptographic Isolation 2025',
        'lines': [
            'STAGE-X.SPACE TECHNICAL ARCHITECTURE BRIEF',
            'License: MIT & Apache 2.0 | Classification: PUBLIC / HEALTHCARE VALIDATED',
            '',
            'EXECUTIVE SUMMARY:',
            'Clinical reasoning systems operating inside hardware-isolated AMD SEV-SNP confidential',
            'enclaves ensuring patient health information is cryptographically inaccessible to host OS.',
            '',
            'KEY ARCHITECTURE PROOFS:',
            '1. Hardware Attestation: Remote attestation of hardware root of trust before key exchange.',
            '2. Ephemeral Isolation: Session memory keys destroyed upon completion of reasoning pass.',
            '3. Verification Pipeline: Deterministic formulary cross-checks with citation chains.',
            '4. Regulatory Compliance: Full HIPAA and GDPR Article 9 technical isolation proofs.',
            '',
            'FIELD MEASUREMENTS:',
            '- Cryptographic Boundary Leakage: 0 bytes across continuous automated penetration tests',
            '- Verification Pass Latency: < 120ms P95 per clinical interaction',
            '- Formulary Alignment Parity: 100% adherence to peer-reviewed clinical protocols',
        ]
    }
}

def generate_pdf(filepath, ref, title, sub, lines):
    t_esc = (ref + ': ' + title).replace('(', '[').replace(')', ']')
    s_esc = sub.replace('(', '[').replace(')', ']')
    
    stream_lines = [
        'BT',
        '/F1 16 Tf',
        '40 750 Td',
        f'({t_esc}) Tj',
        '/F2 10 Tf',
        '0 -22 Td',
        f'({s_esc}) Tj',
        '0 -20 Td',
        'ET',
        'BT',
        '/F2 10 Tf',
        '40 680 Td',
        '14 TL',
    ]
    for line in lines:
        line_esc = line.replace('(', '[').replace(')', ']')
        stream_lines.append(f'({line_esc}) Tj')
        stream_lines.append('T*')
    stream_lines.append('ET')
    
    stream_data = '\n'.join(stream_lines).encode('latin1')
    
    objs = [
        b'<< /Type /Catalog /Pages 2 0 R >>',
        b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
        f'<< /Length {len(stream_data)} >>\nstream\n'.encode('latin1') + stream_data + b'\nendstream',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    ]
    
    out = [b'%PDF-1.4\n']
    offsets = []
    for i, obj in enumerate(objs, 1):
        offsets.append(sum(len(x) for x in out))
        out.append(f'{i} 0 obj\n'.encode('latin1') + obj + b'\nendobj\n')
        
    startxref = sum(len(x) for x in out)
    out.append(f'xref\n0 {len(objs)+1}\n0000000000 65535 f \n'.encode('latin1'))
    for off in offsets:
        out.append(f'{off:010d} 00000 n \n'.encode('latin1'))
    out.append(f'trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{startxref}\n%%EOF'.encode('latin1'))
    
    with open(filepath, 'wb') as f:
        f.write(b''.join(out))
    print(f'Generated {filepath} ({len(b"".join(out))} bytes)')

if __name__ == '__main__':
    for fname, d in BRIEFS.items():
        p = os.path.join('briefs', fname)
        generate_pdf(p, d['ref'], d['title'], d['sub'], d['lines'])
