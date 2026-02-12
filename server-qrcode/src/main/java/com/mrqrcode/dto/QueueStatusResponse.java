package com.mrqrcode.dto;

import java.util.List;

public record QueueStatusResponse(
    int currentServing,
    long waitingCount,
    List<Integer> waitingPasswords
) {}
