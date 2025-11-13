package com.example.provider;

import com.example.model.Member;
import com.example.model.Publication;
import java.util.List;

public interface PublicationProvider {
    Member getMemberDetails(String openAlexId);
    List<Publication> getPublications(String openAlexId, Member member);
}
