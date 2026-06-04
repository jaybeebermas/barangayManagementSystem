<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Barangay Clearance - {{ $clearance->clearance_number }}</title>
    <style>
        /* Standard page margin setup in DomPDF */
        @page {
            size: letter portrait;
            margin: 40px 50px 40px 50px !important;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            line-height: 1.5;
            background-color: #ffffff;
            margin: 40px 50px 40px 50px !important; /* Force margin if @page is ignored */
        }

        .page {
            position: relative;
        }

        /* Watermark - rotated and centered within the text area */
        .watermark {
            position: absolute;
            top: 3.5in;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 60px;
            color: rgba(0, 0, 0, 0.015);
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 8px;
            z-index: -100;
            transform: rotate(-25deg);
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px double #333;
            padding-bottom: 10px;
        }

        .header .republic {
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #555;
            margin-bottom: 2px;
        }

        .header .province-city {
            font-size: 9.5px;
            color: #555;
            margin-bottom: 2px;
        }

        .header .barangay-name {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #1a1a1a;
            margin: 4px 0;
        }

        .header .office {
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #555;
        }

        /* Title */
        .title {
            text-align: center;
            margin: 15px 0 10px;
        }

        .title h1 {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 5px;
            color: #1a1a1a;
            border-bottom: 2px solid #333;
            display: inline-block;
            padding-bottom: 3px;
        }

        /* Clearance Number */
        .clearance-number {
            text-align: center;
            margin-bottom: 20px;
            font-size: 10px;
            color: #555;
        }

        .clearance-number strong {
            color: #1a1a1a;
        }

        /* Content */
        .content {
            margin: 15px 0;
        }

        .to-whom {
            font-weight: bold;
            font-size: 11.5px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }

        .body-text {
            text-align: justify;
            font-size: 11.5px;
            line-height: 1.7;
            text-indent: 40px;
            margin-bottom: 12px;
        }

        .resident-name {
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
        }

        .purpose-text {
            font-weight: bold;
            text-transform: uppercase;
        }

        /* Details table */
        .details-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
        }

        .details-table td {
            padding: 5px 0;
            font-size: 11px;
            vertical-align: top;
        }

        .details-table .label {
            font-weight: bold;
            color: #555;
            width: 25%;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 1px;
        }

        .details-table .value {
            color: #1a1a1a;
            font-weight: 600;
        }

        /* Signatures */
        .signatures {
            margin-top: 30px;
            width: 100%;
        }

        .signature-block {
            width: 230px;
            float: left;
            text-align: center;
        }

        .signature-block.right {
            float: right;
        }

        .signature-line {
            border-top: 1px solid #333;
            width: 100%;
            margin: 0 auto;
            padding-top: 5px;
        }

        .signature-name {
            font-weight: bold;
            font-size: 11.5px;
            text-transform: uppercase;
        }

        .signature-title {
            font-size: 9px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
        }

        /* Footer - positioned at the bottom margin limit of the page */
        .footer {
            position: fixed;
            bottom: -20px;
            left: 0;
            right: 0;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 8px;
            color: #999;
        }

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Watermark -->
        <div class="watermark">BARANGAY CLEARANCE</div>

        <!-- Header -->
        <div class="header">
            <p class="republic">Republic of the Philippines</p>
            <p class="province-city">
                Province of {{ $settings->province ?? '_______________' }} &bull;
                Municipality/City of {{ $settings->municipality ?? '_______________' }}
            </p>
            <p class="barangay-name">Barangay {{ $settings->barangay_name ?? '_______________' }}</p>
            <p class="office">Office of the Barangay Chairman</p>
        </div>

        <!-- Title -->
        <div class="title">
            <h1>Barangay Clearance</h1>
        </div>

        <!-- Clearance Number -->
        <div class="clearance-number">
            Control No: <strong>{{ $clearance->clearance_number }}</strong>
        </div>

        <!-- Content Body -->
        <div class="content">
            <p class="to-whom">To Whom It May Concern:</p>

            <p class="body-text">
                This is to certify that
                <span class="resident-name">{{ $resident->first_name ?? '' }} {{ $resident->last_name ?? '' }}</span>,
                of legal age,
                @if($resident->birthdate)
                    born on <strong>{{ \Carbon\Carbon::parse($resident->birthdate)->format('F d, Y') }}</strong>,
                @endif
                is a bonafide resident of
                <strong>Barangay {{ $settings->barangay_name ?? '_______________' }},
                {{ $settings->municipality ?? '_______________' }},
                {{ $settings->province ?? '_______________' }}</strong>.
            </p>

            <p class="body-text">
                Based on the records available in this office, the above-named person has
                <strong>NO DEROGATORY RECORD</strong> filed in this Barangay.
            </p>

            <p class="body-text">
                This clearance is issued upon the request of the above-named person for
                <span class="purpose-text">{{ $clearance->purpose }}</span>
                purposes and for whatever legal purpose it may serve.
            </p>
        </div>

        <!-- Dates Section -->
        <div class="dates-section">
            <table class="details-table">
                <tr>
                    <td class="label">Date Issued:</td>
                    <td class="value">{{ \Carbon\Carbon::parse($clearance->issued_on)->format('F d, Y') }}</td>
                </tr>
                <tr>
                    <td class="label">Valid Until:</td>
                    <td class="value">{{ \Carbon\Carbon::parse($clearance->valid_until)->format('F d, Y') }}</td>
                </tr>
                <tr>
                    <td class="label">Status:</td>
                    <td class="value">{{ ucfirst($clearance->status) }}</td>
                </tr>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signatures clearfix">
            <div class="signature-block">
                <div style="height: 45px;"></div>
                <div class="signature-line">
                    <p class="signature-name">{{ $issuer->first_name ?? '' }} {{ $issuer->last_name ?? '' }}</p>
                    <p class="signature-title">{{ $issuer->role ?? 'Issuing Officer' }}</p>
                </div>
            </div>

            <div class="signature-block right">
                <div style="height: 45px;"></div>
                <div class="signature-line">
                    <p class="signature-name">_________________________</p>
                    <p class="signature-title">Punong Barangay</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This document is system-generated. &bull; {{ $clearance->clearance_number }}</p>
            @if($settings && $settings->contact_number)
                <p>Contact: {{ $settings->contact_number }} | {{ $settings->email ?? '' }}</p>
            @endif
        </div>
    </div>
</body>
</html>
