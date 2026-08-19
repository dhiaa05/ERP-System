<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('category')->latest('date');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('description', 'like', "%{$search}%");
        }

        if ($request->filled('expense_category_id')) {
            $query->where('expense_category_id', $request->input('expense_category_id'));
        }

        $perPage = $request->input('per_page', 15);
        return ExpenseResource::collection($query->paginate($perPage));
    }

    public function store(StoreExpenseRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        
        $expense = Expense::create($data);
        return new ExpenseResource($expense->load('category'));
    }

    public function show(Expense $expense)
    {
        return new ExpenseResource($expense->load('category'));
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        $expense->update($data);
        return new ExpenseResource($expense->load('category'));
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->noContent();
    }
}
