package com.mrqrcode.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Map;

@ApplicationScoped
public class QrCodeService {

    private static final int DEFAULT_SIZE = 300;

    public String generateSvg(String content) {
        return generateSvg(content, DEFAULT_SIZE);
    }

    public String generateSvg(String content, int size) {
        try {
            var hints = Map.of(
                EncodeHintType.MARGIN, 1,
                EncodeHintType.CHARACTER_SET, "UTF-8"
            );

            var writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size, hints);

            var svg = new StringBuilder();
            svg.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
            svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" ");
            svg.append("viewBox=\"0 0 ").append(size).append(" ").append(size).append("\" ");
            svg.append("width=\"").append(size).append("\" height=\"").append(size).append("\">\n");
            svg.append("<rect width=\"100%\" height=\"100%\" fill=\"#ffffff\"/>\n");

            for (int y = 0; y < matrix.getHeight(); y++) {
                for (int x = 0; x < matrix.getWidth(); x++) {
                    if (matrix.get(x, y)) {
                        svg.append("<rect x=\"").append(x)
                           .append("\" y=\"").append(y)
                           .append("\" width=\"1\" height=\"1\" fill=\"#000000\"/>\n");
                    }
                }
            }

            svg.append("</svg>");
            return svg.toString();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar QR Code: " + e.getMessage(), e);
        }
    }
}
