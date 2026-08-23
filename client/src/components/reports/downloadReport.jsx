"use client";

import { useState } from "react";
import {
  Download,
  Loader2,
} from "lucide-react";

export default function DownloadReport({
  data,
  dateRange,
}) {
  const [loading, setLoading] =
    useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const { default: jsPDF } =
        await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 18;

      /*
       * =====================================================
       * HEADER
       * =====================================================
       */

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(30, 41, 59);

      pdf.text(
        "RecoverOS",
        margin,
        20
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);

      pdf.text(
        "Revenue Recovery Report",
        margin,
        27
      );

      /*
       * =====================================================
       * REPORT PERIOD
       * =====================================================
       */

      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);

      pdf.text(
        "Report Period",
        margin,
        39
      );

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 41, 59);

      pdf.text(
        `${dateRange.from}  →  ${dateRange.to}`,
        margin,
        45
      );

      /*
       * =====================================================
       * GENERATED DATE
       * =====================================================
       */

      const generatedDate =
        new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);

      pdf.text(
        `Generated on ${generatedDate}`,
        pageWidth - margin,
        45,
        {
          align: "right",
        }
      );

      /*
       * =====================================================
       * DIVIDER
       * =====================================================
       */

      pdf.setDrawColor(
        226,
        232,
        240
      );

      pdf.line(
        margin,
        52,
        pageWidth - margin,
        52
      );

      /*
       * =====================================================
       * METRIC CARDS
       * =====================================================
       */

      const metrics = [
        {
          label: "AT RISK",
          value: data.metrics.atRisk,
          change: data.changes.atRisk,
        },
        {
          label: "RECOVERED",
          value: data.metrics.recovered,
          change: data.changes.recovered,
        },
        {
          label: "RECOVERY RATE",
          value: data.metrics.recoveryRate,
          change: data.changes.recoveryRate,
        },
        {
          label: "AVG TIME TO RECOVERY",
          value:
            data.metrics.averageRecoveryTime,
          change:
            data.changes.averageRecoveryTime,
        },
      ];

      const cardGap = 5;

      const cardWidth =
        (pageWidth -
          margin * 2 -
          cardGap * 3) /
        4;

      const cardHeight = 35;

      const cardY = 62;

      metrics.forEach(
        (metric, index) => {
          const x =
            margin +
            index *
              (cardWidth + cardGap);

          /*
           * Card background
           */

          pdf.setFillColor(
            248,
            250,
            252
          );

          pdf.setDrawColor(
            226,
            232,
            240
          );

          pdf.roundedRect(
            x,
            cardY,
            cardWidth,
            cardHeight,
            2,
            2,
            "FD"
          );

          /*
           * Label
           */

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(6.5);

          pdf.setTextColor(
            100,
            116,
            139
          );

          pdf.text(
            metric.label,
            x + 4,
            cardY + 8
          );

          /*
           * Value
           */

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(
            metric.value.length > 8
              ? 12
              : 15
          );

          pdf.setTextColor(
            30,
            41,
            59
          );

          pdf.text(
            metric.value,
            x + 4,
            cardY + 19
          );

          /*
           * Change
           */

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(6.5);

          pdf.setTextColor(
            22,
            163,
            74
          );

          pdf.text(
            `↗ ${metric.change}`,
            x + 4,
            cardY + 28
          );

          pdf.setTextColor(
            148,
            163,
            184
          );

          pdf.text(
            "vs previous period",
            x + 4,
            cardY + 32
          );
        }
      );

      /*
       * =====================================================
       * SUMMARY SECTION
       * =====================================================
       */

      const summaryY = 108;

      pdf.setFillColor(
        255,
        255,
        255
      );

      pdf.setDrawColor(
        226,
        232,
        240
      );

      pdf.roundedRect(
        margin,
        summaryY,
        pageWidth - margin * 2,
        86,
        3,
        3,
        "FD"
      );

      /*
       * Summary heading
       */

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(12);

      pdf.setTextColor(
        30,
        41,
        59
      );

      pdf.text(
        "Report Summary",
        margin + 7,
        summaryY + 12
      );

      /*
       * Summary subtitle
       */

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7.5);

      pdf.setTextColor(
        148,
        163,
        184
      );

      pdf.text(
        "Auto-generated narrative for the selected period",
        margin + 7,
        summaryY + 18
      );

      /*
       * Summary paragraph 1
       */

      let textY =
        summaryY + 32;

      pdf.setFontSize(9);

      pdf.setTextColor(
        71,
        85,
        105
      );

      const paragraphOne =
        `The agent handled ${data.summary.eventsHandled.toLocaleString(
          "en-IN"
        )} events during this period, recovering ${data.summary.recoveredAmount} of ${data.summary.atRiskAmount} at risk.`;

      const paragraphOneLines =
        pdf.splitTextToSize(
          paragraphOne,
          pageWidth - margin * 2 - 14
        );

      pdf.text(
        paragraphOneLines,
        margin + 7,
        textY
      );

      textY +=
        paragraphOneLines.length * 5 +
        5;

      /*
       * Summary paragraph 2
       */

      const paragraphTwo =
        `${data.summary.topCauses.join(
          ", "
        )} accounted for ${data.summary.failureShare} of all payment failures.`;

      const paragraphTwoLines =
        pdf.splitTextToSize(
          paragraphTwo,
          pageWidth - margin * 2 - 14
        );

      pdf.text(
        paragraphTwoLines,
        margin + 7,
        textY
      );

      textY +=
        paragraphTwoLines.length * 5 +
        5;

      /*
       * Summary paragraph 3
       */

      const paragraphThree =
        `Recovery rate held at ${data.summary.recoveryRate} against a ${data.summary.baseline} rules-based baseline, with a median resolution time of ${data.summary.medianResolutionTime}.`;

      const paragraphThreeLines =
        pdf.splitTextToSize(
          paragraphThree,
          pageWidth - margin * 2 - 14
        );

      pdf.text(
        paragraphThreeLines,
        margin + 7,
        textY
      );

      /*
       * =====================================================
       * RECOVERY INSIGHT
       * =====================================================
       */

      const insightY =
        summaryY + 96;

      pdf.setFillColor(
        236,
        253,
        245
      );

      pdf.setDrawColor(
        167,
        243,
        208
      );

      pdf.roundedRect(
        margin,
        insightY,
        pageWidth - margin * 2,
        27,
        3,
        3,
        "FD"
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        5,
        150,
        105
      );

      pdf.text(
        "Recovery Performance",
        margin + 7,
        insightY + 10
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7.5);

      pdf.setTextColor(
        71,
        85,
        105
      );

      pdf.text(
        `The recovery agent achieved ${data.summary.recoveryRate} recovery rate, outperforming the ${data.summary.baseline} rules-based baseline.`,
        margin + 7,
        insightY + 17
      );

      /*
       * =====================================================
       * FOOTER
       * =====================================================
       */

      pdf.setDrawColor(
        226,
        232,
        240
      );

      pdf.line(
        margin,
        pageHeight - 18,
        pageWidth - margin,
        pageHeight - 18
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7);

      pdf.setTextColor(
        148,
        163,
        184
      );

      pdf.text(
        "RecoverOS • Revenue Recovery Intelligence",
        margin,
        pageHeight - 10
      );

      pdf.text(
        `${dateRange.from} → ${dateRange.to}`,
        pageWidth - margin,
        pageHeight - 10,
        {
          align: "right",
        }
      );

      /*
       * =====================================================
       * DOWNLOAD
       * =====================================================
       */

      pdf.save(
        `RecoverOS-Report-${dateRange.from}-${dateRange.to}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      alert(
        "Unable to generate the PDF. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="
        flex
        h-9
        items-center
        gap-2
        rounded-md
        border
        border-slate-200
        bg-white
        px-3
        text-[10px]
        font-medium
        text-slate-700
        transition
        hover:bg-slate-50
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <Loader2
          size={13}
          className="animate-spin"
        />
      ) : (
        <Download size={13} />
      )}

      {loading
        ? "Generating..."
        : "Download Report"}
    </button>
  );
}