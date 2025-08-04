import { Request, Response } from "express";

export const downloadContact = async (req, res) => {
    try {
        const contactName = "Duo Fusion";
        const phoneNumber = "+91 9876543210";
        const email = "duofusion@gmail.com";

        const vCardData = `
                          BEGIN:VCARD
                          VERSION:3.0
                          FN:${contactName}
                          TEL;TYPE=CELL:${phoneNumber}
                          EMAIL:${email}
                          END:VCARD`.trim();

        res.setHeader("Content-Type", "text/vcard; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${contactName.replace(/ /g, "_")}.vcf"`
        );

        return res.status(200).send(vCardData);
    } catch (error) {
        console.error("Download vCard error:", error);
        return res.status(500).json({
            success: false, message: "Failed to download contact", error,
        });
    }
};
