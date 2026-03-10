package com.user.UserProfile.Feign.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public record BookResponce(

        @JsonProperty("id")          Long   B_id,
        @JsonProperty("name")        String B_name,
        @JsonProperty("author")      String B_author,
        @JsonProperty("description") String B_description,
        @JsonProperty("imageUrl")    String B_imageUrl,
        @JsonProperty("pdfUrl")      String B_pdfUrl,
        @JsonProperty("releaseDate") Date   releaseDate,
        @JsonProperty("category")    String B_Category,
        @JsonProperty("language")    String B_Language

) {
    public String nameOrDefault()        { return B_name        != null ? B_name        : "Unavailable"; }
    public String authorOrDefault()      { return B_author      != null ? B_author      : "Unavailable"; }
    public String descriptionOrDefault() { return B_description != null ? B_description : "Unavailable"; }
    public String imageUrlOrDefault()    { return B_imageUrl    != null ? B_imageUrl    : null;          }
    public String categoryOrDefault()    { return B_Category    != null ? B_Category    : "Unknown";     }
    public String languageOrDefault()    { return B_Language    != null ? B_Language    : "Unknown";     }
}