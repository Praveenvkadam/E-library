package com.BookUpload.BookUpload.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;


public record BookResponce(
        @JsonProperty("id")          Long B_id,
        @JsonProperty("name")        String B_name,
        @JsonProperty("author")      String B_author,
        @JsonProperty("description") String B_description,
        @JsonProperty("imageUrl")    String B_imageUrl,
        @JsonProperty("pdfUrl")      String B_pdfUrl,
        @JsonProperty("releaseDate") Date releaseDate,
        @JsonProperty("category")    String B_Category,
        @JsonProperty("language")    String B_Language
) {}