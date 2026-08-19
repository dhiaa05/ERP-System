<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseCategoryResource;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        return ExpenseCategoryResource::collection(ExpenseCategory::all());
    }
}
