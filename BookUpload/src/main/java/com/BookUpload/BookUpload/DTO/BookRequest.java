package com.BookUpload.BookUpload.DTO;

import java.util.Date;

public record BookRequest(
        String B_name,
        String B_author,
        String B_description,
        String B_imageUrl,
        String B_pdfUrl,
        Date releaseDate,
        String B_Category,
        String B_Language

) {
}
